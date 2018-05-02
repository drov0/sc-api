const db = require("./config.js");
var http = require('http');
const sanitize = require("xss");
var fs = require('fs');
const express = require('express');
const download = require('download');
const {promisify} = require('util');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});

const fn = promisify(db.query).bind(db);

const app = express();

const csv_url = "https://docs.google.com/spreadsheets/d/1jOZRIfoZ-5WAjMMQYSH4_8o0b11Ua1Bcx_sCBKRGgGc/export?format=csv";
const filename = "./blacklist/Public Blacklist - Abusers - Sheet1.csv";


function checkgroupdata_add(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['description'] && data['name'] !== "" && data['description'] !== "") {
            let result = await fn("select * from _group where name = ?", [data['name']]);
            if (result.length > 0)
                return resolve({error: "Group name already defined"});
            else
                return resolve({error: ""})
        }
        else
            return resolve({error: "invalid name or description"})
    });
}


function group_edit(data)
{
    return new Promise(async resolve => {
        if (data['name'] && data['description'] && data['name'] !== "" && data['description'] !== "") {
            let result = await fn("select * from _group where name = ?", [data['name']]);
            if (result.length > 0) {
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
            let result = await fn("select * from _group where name = ?", [data['name']]);
            if (result.length > 0) {
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

function list_add(data, list)
{
    return new Promise(async resolve => {
        if (data['name'] && data['group'] && data['category'] && data['added_by'] && data['name'] !== "" && data['group'] !== "" && data['category'] !== "" && data['added_by'] !== "") {
            const result = await fn("select id from _group where name = ?", [data['group']]);

            if (result.length > 0) {
                const id = result[0]['id'];
                if (list === "blacklist") {
                    await fn("insert into blacklist (name, _group, category, added_by) VALUES(?,?,?,?)", [data['name'], id, data['category'], data['added_by']]).catch(function (err) {
                        if (err.code === "ER_DUP_ENTRY")
                            return resolve({error: "User is already in the list"});
                        else
                            return resolve({error: "Internal error"});
                    });
                    return resolve({ok: "ok"});
                }
                else if (list === "low_quality") {
                    await fn("insert into low_quality (name, _group, category, added_by) VALUES(?,?,?,?)", [data['name'], id, data['category'], data['added_by']]).catch(function (err) {
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

function list_edit(data, list)
{
    return new Promise(async resolve => {
        if (data['name'] && data['group'] && data['category'] && data['added_by'] && data['name'] !== "" && data['group'] !== "" && data['category'] !== "" && data['added_by'] !== "") {
            const result = await fn("select id from _group where name = ?", [data['group']]);

            if (result.length > 0) {
                const id = result[0]['id'];
                const exists = await fn("select 1 from "+list+" where name = ?", [data['name']]);
                if (exists.length > 0) {

                    await fn("update " + list + " set _group = ?, category = ?, added_by = ? where name = ?", [id, data['category'], data['added_by'], data['name']]).catch(function (err) {
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
                const id = result[0]['id'];
                const exists = await fn("select 1 from "+list+" where name = ?", [data['name']]);
                if (exists.length > 0) {

                    await fn("delete from " + list + " where name = ?", [data['name']]).catch(function (err) {
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

app.post('/', urlencodedParser, async function (req, res) {
    var data = sanitize(req.body.data);

    try
    {
        data = JSON.parse(data)['data'];
    } catch (e)
    {
        return res.send({error:"Invalid json"})
    }

    if (data['action'] === "add")
    {
        // TODO : Add authentification
        if (data['list'] === "group")
        {
            const checkresult = await checkgroupdata_add(data);
            if (checkresult.error === "")
            {
                await fn("INSERT INTO _group(id,name,description) VALUES(NULL,? ,?)", [data['name'], data['description']])
                res.send({ok:"ok"})
            } else
                res.send(checkresult)
        } else if (data['list'] === "blacklist")
        {
            const checkresult = await list_add(data, "blacklist");
            res.send(checkresult)
        } else if (data['list'] === "low_quality")
        {
            const checkresult = await list_add(data, "low_quality");
            res.send(checkresult)
        } else
        {
            res.send({error:"Unknown list"})
        }
    } else if (data['action'] === "edit")
    {
        if (data['list'] === "group")
        {
            const edit_result = await group_edit(data);
            return res.send(edit_result);
        } else if (data['list'] === "blacklist" || data['list'] === "low_quality")
        {
            res.send((await list_edit(data, data['list'])));
        } else
        {
            res.send({error:"Unknown list"})
        }

    } else if (data['action'] === "delete")
    {
        if (data['list'] === "group")
        {
            const edit_result = await group_delete(data);
            return res.send(edit_result);
        } else if (data['list'] === "blacklist" || data['list'] === "low_quality")
        {
            res.send((await list_delete(data, data['list'])));
        } else
        {
            res.send({error:"Unknown list"})
        }
    } else if (data['action'] === "get")
    {
        res.send((await list_get(data, data['list'])));
    }


});

app.listen(8080, function () {
    console.log("steempress-catcher is ready to go !")
});


async function storedata() {
    await download(csv_url, 'blacklist');

    let data = fs.readFileSync(filename).toString().split("\r\n");

    for (let i = 0; i < data.length; i++)
    {
        fn("INSERT INTO blacklist(name) VALUES(?) ", [data[i]]).catch(function (err) {
            if (err.code !== "ER_DUP_ENTRY")
                console.log(err)
        })
    }

    console.log("done");
}





/*

json examples

ALTER TABLE Orders
ADD FOREIGN KEY (PersonID) REFERENCES Persons(PersonID);

ALTER TABLE `blacklist` ADD `_group` INT NOT NULL AFTER `name`;

add a group

curl --data 'data={"data":{"action":"add","list":"group","name":"noganoo","description":"bad mofo"}}' http://localhost:8080

add an user to the blacklist

curl --data 'data={"data":{"action":"add","list":"blacklist","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice"}}' http://localhost:8080

add an user to the low_quality list

{"data":{"action":"add","list":"low_quality","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice"}}


edit a group :

curl --data 'data={"data":{"action":"edit","list":"group","name":"noganoo","description":"meanie"}}' http://localhost:8080

edit a list

curl --data 'data={"data":{"action":"edit","list":"blacklist","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice"}}' http://localhost:8080

get an user

curl --data 'data={"data":{"action":"get","name":"noganoo"}}' http://localhost:8080

returns {"list":"none"} or {"list":"low_quality"} or {"list":"blacklist"}



 */