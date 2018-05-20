const {promisify} = require('util');

const config = require("./config.js");

const fn = promisify(config.db.query).bind(config.db);

function group_add(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['description'] && data['name'] !== "" && data['description'] !== "") {
            if ((await fn("select 1 from _group where name = ?", [data['name']])).length > 0)
                return resolve({error: "Group name already defined"});
            else
                await fn("INSERT INTO _group(id,name,description) VALUES(NULL,? ,?)", [data['name'], data['description']]).catch(function (err) {
                    return resolve({error: "Internal server error"});
                });

            return resolve({ok:"ok"})
        }
        else
            return resolve({error: "invalid name or description"})
    });
}

// TODO : Add a new parameter to edit the group name as well
function group_edit(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['description'] && data['name'] !== "" && data['description'] !== "") {
            if ((await fn("select * from _group where name = ?", [data['name']])).length > 0) {
                await fn("UPDATE _group set description = ? where name = ?", [data['description'], data['name']]).catch(function (err) {
                    return resolve({error: "Internal server error"});
                });
                return resolve({ok: "ok"});
            }
            else
                return resolve({error: "group not found"})
        }
        else
            return resolve({error: "invalid name or description"})
    });
}

function group_delete(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['name'] !== "") {
            if ((await fn("select * from _group where name = ?", [data['name']])).length > 0) {
                await fn("DELETE FROM _group where name = ?", [data['name']]).catch(function (err) {
                    return resolve({error: "Internal server error"});
                });
                return resolve({ok: "ok"});
            }
            else
                return resolve({error: "group not found"})
        }
        else
            return resolve({error: "invalid name"})
    });
}

function list_add(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['group'] && data['category'] && data['added_by'] && data['name'] !== "" && data['group'] !== "" && data['category'] !== "" && data['added_by'] !== "") {
            const result = await fn("select id from _group where name = ?", [data['group']]);
            if (result.length > 0) {
                const id = result[0]['id'];

                // TODO : Refactor to avoid the duplicate code
                if (data['list'] === "blacklist")
                    if ((await fn("select 1 from low_quality where name = ?", [data['name']])).length > 0)
                        return resolve({error: "User is already in the low_quality list"});
                    else
                    {
                        await fn("insert into "+data['list']+" (name, _group, category, added_by) VALUES(?,?,?,?)", [data['name'], id, data['category'], data['added_by']]).catch(function (err) {
                            if (err.code === "ER_DUP_ENTRY")
                                return resolve({error: "User is already in the list"});
                            else
                                return resolve({error: "Internal error"});
                        });
                        return resolve({ok: "ok"});
                    }
                else if (data['list'] === "low_quality")
                    if ((await fn("select 1 from blacklist where name = ?", [data['name']])).length > 0)
                        return resolve({error: "User is already in the blacklist list"});
                    else
                    {
                        await fn("insert into "+data['list']+" (name, _group, category, added_by) VALUES(?,?,?,?)", [data['name'], id, data['category'], data['added_by']]).catch(function (err) {
                            if (err.code === "ER_DUP_ENTRY")
                                return resolve({error: "User is already in the list"});
                            else
                                return resolve({error: "Internal error"});
                        });
                        return resolve({ok: "ok"});
                    }
            }
            else
                return resolve({error: "Group name unknown"});
        }
        else
        // TODO : Be more specific
            return resolve({error: "invalid parameters."})
    });
}

function list_edit(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['group'] && data['category'] && data['added_by'] && data['name'] !== "" && data['group'] !== "" && data['category'] !== "" && data['added_by'] !== "") {
            const result = await fn("select id from _group where name = ?", [data['group']]);

            if (result.length > 0) {
                const id = result[0]['id'];
                const exists = await fn("select 1 from "+data['list']+" where name = ?", [data['name']]);
                if (exists.length > 0) {

                    await fn("update " + data['list'] + " set _group = ?, category = ?, added_by = ? where name = ?", [id, data['category'], data['added_by'], data['name']]).catch(function (err) {
                        return resolve({error: "Internal error"});
                    });
                    return resolve({ok: "ok"});
                } else
                    return resolve({error: "username not in the list"});
            }
            else
                return resolve({error: "Group name unknown"});
        }
        else
        // TODO : Be more specific
            return resolve({error: "invalid parameters."})
    });
}

function list_delete(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['name'] !== "") {
            const exists = await fn("select 1 from "+data['list']+" where name = ?", [data['name']]);
            if (exists.length > 0) {
                await fn("delete from " + data['list'] + " where name = ?", [data['name']]).catch(function (err) {
                    return resolve({error: "Internal error"});
                });
                return resolve({ok: "ok"});
            } else
                return resolve({error: "username not in the list"});
        }
        else
        // TODO : Be more specific
            return resolve({error: "invalid parameters."})
    });
}

function list_get(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['name'] !== "") {
            const blacklist = await fn("select 1 from blacklist where name = ?", [data['name']]);
            if (blacklist.length > 0)
                return resolve({list:"blacklist"});

            const low_quality = await fn("select 1 from low_quality where name = ?", [data['name']]);
            if (low_quality.length > 0)
                return resolve({list:"low_quality"});

            return resolve({list:"none"});
        }
        else
        // TODO : Be more specific
            return resolve({error: "invalid parameters."})
    });
}

module.exports = {group_add,
		  group_edit,
		  group_delete,
		  list_add,
		  list_edit,
		  list_delete,
		  list_get};
