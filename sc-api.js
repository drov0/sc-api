const db = require("./config.js");
var http = require('http');
var fs = require('fs');
const express = require('express');
const download = require('download');
const {promisify} = require('util');
const fn = promisify(db.query).bind(db);

const app = express();

const csv_url = "https://docs.google.com/spreadsheets/d/1jOZRIfoZ-5WAjMMQYSH4_8o0b11Ua1Bcx_sCBKRGgGc/export?format=csv";
const filename = "./blacklist/Public Blacklist - Abusers - Sheet1.csv";

app.get('/', function (req, res) {
    res.send("If you are looking for the original <a href='https://steemit.com/christmas/@fredrikaa/introducing-steem-gift-cards-a-fun-way-to-give-someone-steem-for-the-holidays'>steemgifts</a> website, it has been discontinued, If you really really want a card though you can run the website yourself : https://github.com/drov0/steemgifts. <br/> If you came here because of steempress, there is nothing for you to see here :)")
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

storedata()