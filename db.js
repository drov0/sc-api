const config = require('./config.js');
const SQL = require('sql-template-strings');
const {promisify} = require('util');
const fn = promisify(config.db.query).bind(config.db);

class DatabaseError extends Error {
    constructor(message) {
	super(message);
	this.name = this.constructor.name
    }
}

class NotFoundError extends DatabaseError{}
class AlreadyPresentError extends DatabaseError{}
class InvalidRecordError extends DatabaseError{}
class UnknownError extends DatabaseError{}

async function gid(groupname)
{
    var results = await fn(SQL`
SELECT id FROM _group 
WHERE name = ${groupname}`);

    if(results.length < 1)
    {
	throw new NotFoundError(`group "${groupname}" not found`);
    }

    var id = results[0].id;
    return id;
}

async function list_groups()
{
    var results = await fn(SQL`
SELECT name FROM _group`);

    var groups = []; 
    for (let result of results)
    {
	groups.push(result.name);
    }
    return groups;
}


async function add_group(groupname, description)
{
    try
    {
	var group_id = await gid(groupname);
	throw new AlreadyPresentError(`group ${groupname} already exists`);
    }
    catch (err)
    {
	if (!(err instanceof NotFoundError))
	{
	    throw err;
	}	    
    }
    
    try
    {
	await fn(SQL`
INSERT INTO _group(name, description)
VALUES(${groupname}, ${description})`)
    }
    catch (err)
    {
	throw new UnknownError("while adding group");
    }
}

async function delete_group(groupname, description)
{
    var group_id = await gid(groupname);

    try
    {
	await fn(SQL`
DELETE FROM _group
WHERE id = ${group_id}`);
    }
    catch (err)
    {	
	throw new UnknownError("while deleting group");
    }
}

async function group_list_members(groupname)
{
    var group_id = await gid(groupname);
    
    var results = await fn(SQL`
SELECT DISTINCT name
FROM (SELECT * FROM blacklist
      WHERE _group = ${group_id}
      UNION
      SELECT * FROM low_quality
      WHERE _group = ${group_id}) AS combined`);

    var users = []
    for(let result of results)
    {	
	users.push(result.name);
    }
    return users;
}

async function list_lists()
{
    return ["blacklist", "low_quality"];
}

async function validate_listname(listname)
{
    lists = await list_lists();
    if(!(lists.includes(listname)))
    {
	throw new NotFoundError(`unsupported list "${listname}"`);
    }
}

async function list_list_members(listname)
{
    await validate_listname(listname);

    var results = await fn(SQL`
SELECT name FROM `.append(listname));

    var members = []; 
    for (let result of results)
    {
	members.push(result.name);
    }
    return members;
}

async function list_get_member(listname, membername)
{
    await validate_listname(listname);

    var record = await fn(SQL`
SELECT _group, category, added_by FROM `.append(listname).append(SQL`
WHERE name = ${membername}`));

    var groupname = await fn(SQL`
SELECT name FROM _group
WHERE id = ${record[0]._group}`);

    return {group: groupname[0].name,
	    category: record[0].category,
	    added_by: record[0].added_by}
}

async function list_add_member(listname, membername, record)
{
    await validate_listname(listname);
    
    var check = await fn(SQL`
SELECT 1 FROM `.append(listname).append(SQL`
WHERE name = ${membername}`));
    
    if(check.length > 0)
	throw new AlreadyPresentError(`member ${membername} is already in list ${listname}`);
    if(record.group === undefined)
	throw new InvalidRecordError("must provide a group");
    if(record.category === undefined)
	throw new InvalidRecordError("must provide a category");
    if(record.added_by === undefined)
	throw new InvalidRecordError("must provide 'added_by' username");

    try
    {
	var group_id = await gid(record.group)
	await fn(SQL`
INSERT INTO `.append(listname).append(SQL`(name, _group, category, added_by)
VALUES(${membername}, ${group_id}, ${record.category}, ${record.added_by})`));
    }
    catch (err)
    {
	if (err instanceof NotFoundError)
	    throw new InvalidRecordError("provided group must already exist");
    }
}

async function list_delete_member(listname, membername)
{
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
		  list_lists,
		  list_list_members,
		  list_get_member,
		  list_add_member,
		  list_delete_member}













