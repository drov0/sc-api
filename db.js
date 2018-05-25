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

async function gid(name)
{
    var results = await fn(SQL`
SELECT id FROM _group 
WHERE name = ${name}`);

    if(results.length < 1)
    {
	throw new NotFoundError();
    }

    var id = results[0].id;
    return id;
}

async function group_list_members(group_id)
{    
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
		  gid,
		  group_list_members}













