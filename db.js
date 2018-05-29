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

class InvalidArgumentError extends DatabaseError {}
class NotFoundError extends DatabaseError{}
class AlreadyPresentError extends DatabaseError{}
class UnknownError extends DatabaseError{}

async function gid(groupname)
{
    var results = await fn(SQL`
SELECT id FROM _group 
WHERE name = ${groupname}`);

    if(results.length < 1)
    {
	throw new NotFoundError();
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
	throw new AlreadyPresentError();
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

module.exports = {DatabaseError,
		  InvalidArgumentError,
		  NotFoundError,
		  AlreadyPresentError,
		  list_groups,
		  delete_group,
		  add_group,
		  group_list_members}













