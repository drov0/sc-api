const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const router = common.Router();

// GET for /groups/:groupname
router.get("/", wrap( async function (req, res) {
    // get all members of the group
    var members = await db.group_list_members(req.params.group);

    return res.send({members: members});
}));

// PUT for /groups/:groupname
router.put("/", wrap( async function(req, res) {
    if(req.body.description === undefined)
	return res.status(400).send({error: "invalid record format"});

    await db.add_group(req.params.group, req.body.description);
    return res.status(204).send();
}));

// DELETE for /groups/:groupname
router.delete("/", wrap( async function(req, res) {
    await db.delete_group(req.params.group);
    return res.status(204).send();
}));
		     
router.use(common.catchErrors);
router.use(common.catchAllRouter);


// export router
module.exports = router;
