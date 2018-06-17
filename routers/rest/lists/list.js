const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const member = require('./list/member.js');

const router = common.Router();

// Define GET method for "individual list" endpoint.
router.get("/", wrap(async function (req, res) {
    // Get all members of the list and send them to the client.
    var members = await db.list_list_members(req.params.list);
    return res.send({members: members});
}));

// PUT and DELETE are not supported for individual lists,
// as the set of lists (unlike groups) are hard-coded and
// immutable.

// Add child router for "list member" endpoint.
router.use("/:member", member);

// Add common middleware.
router.use(common.catchErrors);
router.use(common.catchAllRouter);

// Export router object as module.
module.exports = router;
