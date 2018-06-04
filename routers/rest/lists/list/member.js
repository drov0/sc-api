const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const router = common.Router();

// Define GET method for "list member" endpoint.
router.get("/", wrap(async function (req, res) {
    // Try to get the member record from the database, and send
    // it to the client.
    output = await db.list_get_member(req.params.list, req.params.member);
    return res.status(200).send(output);
}));

// Define PUT method for "list member" endpoint.
// This method requires authentication.
router.put("/", common.requireAuth, wrap(async function(req, res) {
    await db.list_add_member(req.params.list, req.params.member, req.body);
    return res.status(204).send();
}));

// Define DELETE method for "list member" endpoint.
// This method requires authentication.
router.delete("/", common.requireAuth, wrap(async function(req, res) {
    await db.list_delete_member(req.params.list, req.params.member);
    return res.status(204).send();
}));

// Add common middleware.
router.use(common.catchErrors);
router.use(common.catchAllRouter);

// Export router object as module.
module.exports = router;
