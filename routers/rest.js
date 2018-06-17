const express = require('express');
const bodyParser = require('body-parser');

const common = require('routers/common.js');
const db = require('db.js');

const groupsRouter = require('./rest/groups.js');
const listsRouter = require('./rest/lists.js');

var router = common.Router();

// Register body-parser middleware and error handler.
router.use(bodyParser.json());
router.use(function(err, req, res, next) {
    if( err.type === 'entity.parse.failed' )
    {
	return res.status(400).send({error: "invalid json in request"});
    }
    else
    {
	next();
    }
});

// Register child routers for aggregate "groups" and "lists" endpoints.
router.use('/groups', groupsRouter);
router.use('/lists', listsRouter);

// Add common middleware.
router.use(common.catchErrors);
router.use(common.catchAllRouter);

// Export router object as module.
module.exports = router;
