const {promisify} = require('util');

const config = require("./config.js");

const fn = promisify(config.db.query).bind(config.db);

function groups_get()
{
    return new Promise(async resolve => {
	var groups = []
	var results = await fn("SELECT name FROM _group");
	for (let result of results)
	{
	    groups.push(result.name);
	}
	return resolve({ok: "ok",
			groups: groups});
    });
}

module.exports = {groups_get}
