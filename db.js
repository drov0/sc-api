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

module.exports = {DatabaseError,
		  InvalidArgumentError,
		  NotFoundError,
		  AlreadyPresentError,
		  list_groups}













