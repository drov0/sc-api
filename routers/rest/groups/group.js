const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const router = common.Router();

// GET for /groups/:groupname
router.get("/", wrap( async function (req, res) {
    // get all members of the group
    var gid = await db.gid(req.params.group);
    var members = await db.group_list_members(gid);

    return res.send({members: members});
}));

router.use(common.catchErrors);
router.use(common.catchAllRouter);

// TODO: PUT and DELETE

// export router
module.exports = router;
