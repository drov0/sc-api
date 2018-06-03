const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const router = common.Router();

// GET for /lists/:list/:member
router.get("/", wrap( async function (req, res) {
    output = await db.list_get_member(req.params.list, req.params.member);
    return res.status(200).send(output);
}));

// PUT for /lists/:list/:member
router.put("/", common.requireAuth, wrap( async function(req, res) {
    await db.list_add_member(req.params.list, req.params.member, req.body);
    return res.status(204).send();
}));

// DELETE for /lists/:list/:member
router.delete("/", common.requireAuth, wrap( async function(req, res) {
    await db.list_delete_member(req.params.list, req.params.member);
    return res.status(204).send();
}));
		     
router.use(common.catchErrors);
router.use(common.catchAllRouter);


// export router
module.exports = router;
