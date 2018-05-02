const db = require("./config.js");
const sanitize = require("xss");
const express = require('express');
const {promisify} = require('util');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});

const fn = promisify(db.query).bind(db);

const app = express();

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


function group_edit(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['description'] && data['name'] !== "" && data['description'] !== "") {
            if ((await fn("select * from _group where name = ?", [data['name']])).length > 0) {
                await fn("UPDATE _group set name = ?, description = ? where name = ?", [data['name'], data['description'], data['name']]).catch(function (err) {
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

function list_delete(data, list)
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

// TODO : Rework all that as a proper REST api ?
app.post('/', urlencodedParser, async function (req, res) {
    let data = sanitize(req.body.data);

    try
    {
        data = JSON.parse(data)['data'];
    } catch (e)
    {
        return res.send({error:"Invalid json"})
    }


    if (data['action'] === "get")
        return res.send((await list_get(data)));


    // TODO : Add authentification
    if (data['list'] !== "blacklist" && data['list'] !== "low_quality"  && data['list'] !== "group")
        return res.send({error:"Unknown list"});

    if (data['action'] === "add")
    {

        if (data['list'] === "group")
            res.send((await group_add(data)));
        else if (data['list'] === "blacklist" || data['list'] === "low_quality")
            res.send((await list_add(data)));
    }
    else if (data['action'] === "edit")
    {
        if (data['list'] === "group")
            res.send((await group_edit(data)));
        else if (data['list'] === "blacklist" || data['list'] === "low_quality")
            res.send((await list_edit(data)));
    }
    else if (data['action'] === "delete")
    {
        if (data['list'] === "group")
            res.send((await group_delete(data)));
        else if (data['list'] === "blacklist" || data['list'] === "low_quality")
            res.send((await list_delete(data)));
    }
    else
        return res.send({error:"Unknown action"})


});

app.listen(8080, function () {
    console.log("steemcleaners api is ready to go !")
});
