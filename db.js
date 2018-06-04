const config = require('./config.js');
const SQL = require('sql-template-strings');
const {promisify} = require('util');
const fn = promisify(config.db.query).bind(config.db);

// Define a custom Error class for database errors. The constructor
// implementation allows more specific errors to be derived as
// one-liners.
class DatabaseError extends Error {
    constructor(message) {
	super(message);
	this.name = this.constructor.name
    }
}
class NotFoundError extends DatabaseError{}
class AlreadyPresentError extends DatabaseError{}
class InvalidRecordError extends DatabaseError{}

// Get the ID of the group with the provided name.
async function gid(groupname) {
    var results = await fn(SQL`
SELECT id FROM _group
WHERE name = ${groupname}`);

    if(results.length < 1) {
	throw new NotFoundError(`group "${groupname}" not found`);
    }

    var id = results[0].id;
    return id;
}

// Return a list of all groups in the database by name.
async function list_groups() {
    var results = await fn(SQL`
SELECT name FROM _group`);

    var groups = [];
    for (let result of results) {
	groups.push(result.name);
    }
    return groups;
}

// Add a group with the provided name and description.
async function add_group(groupname, description) {
    try {
	var group_id = await gid(groupname);
	throw new AlreadyPresentError(`group "${groupname}" already exists`);
    } catch (err) {
	if (!(err instanceof NotFoundError))
	    throw err;
    }

    await fn(SQL`
INSERT INTO _group(name, description)
VALUES(${groupname}, ${description})`)

}

// Delete the group with the provided name.
async function delete_group(groupname) {
    var group_id = await gid(groupname);

    await fn(SQL`
DELETE FROM _group
WHERE id = ${group_id}`);
}

// List the members in the group with the provided name.
async function group_list_members(groupname) {
    var group_id = await gid(groupname);

    var results = await fn(SQL`
SELECT DISTINCT name
FROM (SELECT * FROM blacklist
      WHERE _group = ${group_id}
      UNION
      SELECT * FROM low_quality
      WHERE _group = ${group_id}) AS combined`);

    var users = []
    for(let result of results) {
	users.push(result.name);
    }
    return users;
}

// Get the description of the group with the provided name.
async function group_get_description(groupname) {
    var group_id = await gid(groupname);

    var results = await fn(SQL`
SELECT description FROM _group
WHERE id = ${group_id}`);

    return results[0].description;
}

// Get the list of lists by name. This one is "cheating" in a way,
// because the internal database representation knows these as
// separate tables. Unless we want to change the database schema,
// the set of lists will remain hard-coded and immutable.
async function list_lists() {
    return ["blacklist", "low_quality"];
}

// Validate the given list name. Used to sanitise input. Together
// with sql-template-strings, this prevents SQL injection attacks.
async function validate_listname(listname) {
    lists = await list_lists();
    if(!(lists.includes(listname)))
    {
	throw new NotFoundError(`unsupported list "${listname}"`);
    }
}

// List all of the members of the provided list by name.
async function list_list_members(listname) {
    await validate_listname(listname);

    var results = await fn(SQL`
SELECT name FROM `.append(listname));

    var members = [];
    for (let result of results) {
	members.push(result.name);
    }
    return members;
}

// Get the database record for a list member. Includes
// group name, category, and who added the user.
async function list_get_member(listname, membername) {
    await validate_listname(listname);

    var record = await fn(SQL`
SELECT _group, category, added_by FROM `.append(listname).append(SQL`
WHERE name = ${membername}`));

    if (record[0] === undefined)
	throw new NotFoundError(`member "${membername}" not found in list "${listname}"`);

    var groupname = await fn(SQL`
SELECT name FROM _group
WHERE id = ${record[0]._group}`);

    return {group: groupname[0].name,
	    category: record[0].category,
	    added_by: record[0].added_by}
}

// Add a user to the provided list with the specified information.
// record should contain the same fields as list_get_member returns.
async function list_add_member(listname, membername, record) {
    await validate_listname(listname);

    var check = await fn(SQL`
SELECT 1 FROM `.append(listname).append(SQL`
WHERE name = ${membername}`));

    if(check.length > 0)
	throw new AlreadyPresentError(`member "${membername}" is already in list "${listname}"`);
    if(record.group === undefined)
	throw new InvalidRecordError("must provide a group");
    if(record.category === undefined)
	throw new InvalidRecordError("must provide a category");
    if(record.added_by === undefined)
	throw new InvalidRecordError("must provide 'added_by' username");

    try {
	var group_id = await gid(record.group)
	await fn(SQL`
INSERT INTO `.append(listname).append(SQL`(name, _group, category, added_by)
VALUES(${membername}, ${group_id}, ${record.category}, ${record.added_by})`));
    } catch (err) {
	if (err instanceof NotFoundError) {
	    throw new InvalidRecordError(`specified group "${record.group}" does not exist`);
	} else {
	    throw err;
	}
    }
}

// Delete the specified member from a list.
async function list_delete_member(listname, membername) {
    await validate_listname(listname);

    var check = await fn(SQL`
SELECT 1 FROM `.append(listname).append(SQL`
WHERE name = ${membername}`));

    if(check.length < 1)
	throw new NotFoundError(`member "${membername}" not found in list "${listname}"`);

    await fn(SQL`
DELETE FROM `.append(listname).append(SQL`
WHERE name = ${membername}`));
}

module.exports = {DatabaseError,
		  NotFoundError,
		  AlreadyPresentError,
		  InvalidRecordError,
		  list_groups,
		  delete_group,
		  add_group,
		  group_list_members,
		  group_get_description,
		  list_lists,
		  list_list_members,
		  list_get_member,
		  list_add_member,
		  list_delete_member}
