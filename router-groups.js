const express = require('express');
const db = require('./database.js');
const db_ng = require('./database-ng.js');

const router = express.Router();

router.get("/", async function (req, res) {
    return res.send((await db_ng.groups_get()));
});

// export router
module.exports = {router};
