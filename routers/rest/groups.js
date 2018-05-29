const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const group = require('./groups/group.js');

const router = common.Router();

// GET for /groups
router.get("/", wrap(async function (req, res, next) {
    groups = await db.list_groups();
    return res.send({groups: groups});
}));

// PUT and DELETE not supported for /groups

router.use("/:group", group);

router.use(common.catchErrors);
router.use(common.catchAllRouter);

// export router
module.exports = router;
