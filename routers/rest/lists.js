const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const common = require('routers/common.js');

const list = require('./lists/list.js');

const router = common.Router();

// Define GET method for "lists" endpoint.
router.get("/", wrap(async function (req, res, next) {
    // Get the list of all lists and send to the client.
    // This is hardcoded, but it's probably a good idea to
    // keep the interface as uniform as possible. Plus,
    // additional lists could be added in the future.
    lists = await db.list_lists();
    return res.send({lists: lists});
}));

// PUT and DELETE not supported for the aggregate "lists"
// endpoint, as the set of lists (unlike groups) are
// hard-coded and immutable.

// Add child router for "individual list" endpoint.
router.use("/:list", list);

router.use(common.catchErrors);
router.use(common.catchAllRouter);

// export router
module.exports = router;
