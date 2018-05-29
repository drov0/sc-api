const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const list = require('./lists/list.js');

const router = common.Router();

// GET for /lists
router.get("/", wrap(async function (req, res, next) {
    lists = await db.list_lists();
    return res.send({lists: lists});
}));

// PUT and DELETE not supported for /lists

router.use("/:list", list);

router.use(common.catchErrors);
router.use(common.catchAllRouter);

// export router
module.exports = router;
