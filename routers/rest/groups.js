const express = require('express');
const wrap = require('express-async-handler');
const db = require('db.js')

const router = express.Router({mergeParams: true});

// GET for /groups
router.get("/", wrap(async function (req, res, next) {
    groups = await db.list_groups();
    return res.send({ok: "ok",
		     groups: groups});
}));

// PUT and DELETE not supported for /groups

// export router
module.exports = router;
