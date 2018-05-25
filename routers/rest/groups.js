const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const router = common.Router()

// GET for /groups
router.get("/", wrap(async function (req, res, next) {
    groups = await db.list_groups();
    return res.send({ok: "ok",
		     groups: groups});
}));

// PUT and DELETE not supported for /groups

router.use(common.catchAllRouter);

// export router
module.exports = router;
