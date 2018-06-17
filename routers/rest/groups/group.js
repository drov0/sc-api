const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const router = common.Router();

// Define GET method for "individual group" endpoint.
router.get("/", wrap(async function (req, res) {
    // Get all the members of the group and its description
    var members = await db.group_list_members(req.params.group);
    var description = await db.group_get_description(req.params.group);

    // Then send them in a JSON object to the user
    return res.send({members: members, description: description});
}));

// Define PUT method for "individual group" endpoint.
// This method requires authentication.
router.put("/", common.requireAuth, wrap(async function(req, res) {
    // Make sure the description is present.
    // If it's not, throw an error.
    if(req.body.description === undefined)
	throw new db.InvalidRecordError('"description" field is required');

    // Add the group to the database and respond 204 No Content.
    // (No need to send anything unless there's an error.)
    await db.add_group(req.params.group, req.body.description);
    return res.status(204).send();
}));

// Define DELETE method for "individual group" endpoint.
// This method requires authentication.
router.delete("/", common.requireAuth, wrap(async function(req, res) {
    // Delete the group from the database and respond 204 No Content.
    // (No need to send anything unless there's an error.)
    await db.delete_group(req.params.group);
    return res.status(204).send();
}));

// Add common listeners.
router.use(common.catchErrors);
router.use(common.catchAllRouter);

// Export router object as module.
module.exports = router;
