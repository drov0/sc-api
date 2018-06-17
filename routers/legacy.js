const sanitize = require('xss');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const express = require('express')

const {login} = require("steem-auth.js");
const {group_add,
       group_edit,
       group_delete,
       list_add,
       list_edit,
       list_delete,
       list_get} = require("database.js");

const router = express.Router();

// TODO : Rework all that as a proper REST api ?
router.post('/', urlencodedParser, async function (req, res) {
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

    // TODO : Proprely separate the json with one data object which handles data and one login object with login infos
    const login_details = await login(data);

    if (login_details['ok'] === true)
    {
        if (data['list'] !== "blacklist" && data['list'] !== "low_quality" && data['list'] !== "group")
            return res.send({error: "Unknown list"});

        if (data['action'] === "add") {
            if (data['list'] === "group")
                return res.send((await group_add(data)));
            else if (data['list'] === "blacklist" || data['list'] === "low_quality")
                return res.send((await list_add(data)));
        }
        else if (data['action'] === "edit") {
            if (data['list'] === "group")
                return res.send((await group_edit(data)));
            else if (data['list'] === "blacklist" || data['list'] === "low_quality")
                return res.send((await list_edit(data)));
        }
        else if (data['action'] === "delete") {
            if (data['list'] === "group")
                return res.send((await group_delete(data)));
            else if (data['list'] === "blacklist" || data['list'] === "low_quality")
                return res.send((await list_delete(data)));
        }
        else
            return res.send({error: "Unknown action"})
    } else
    {
        return res.send({error: login_details['error']})
    }

    return res.send({error: "Unknown action"})

});

module.exports = router;
