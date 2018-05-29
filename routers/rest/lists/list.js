const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const member = require('./list/member.js');

const router = common.Router();

// GET for /lists/:listname
router.get("/", wrap( async function (req, res) {
    // get all members of the list
    var members = await db.list_list_members(req.params.list);

    return res.send({members: members});
}));

// PUT and DELETE not supported for individual lists
// (they are hardcoded for now)

router.use("/:member", member);

router.use(common.catchErrors);
router.use(common.catchAllRouter);


// export router
module.exports = router;
