const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const group = require('./groups/group.js');

const router = common.Router();

// Define GET method for "groups" endpoint.
router.get("/", wrap(async function (req, res, next) {
    // Get the list of all groups by name and send to client.
    groups = await db.list_groups();
    return res.send({groups: groups});
}));

// PUT and DELETE are not supported for the aggregate "groups"
// endpoint, as replacing or deleting the entire set of groups
// is probably not desired.

// Add child router for "individual group" endpoint.
router.use("/:group", group);

// Add common middleware.
router.use(common.catchErrors);
router.use(common.catchAllRouter);

// Export router object as module.
module.exports = router;
