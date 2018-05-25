const express = require('express');
const bodyParser = require('body-parser');

const groupsRouter = require('./router-groups.js');
const listsRouter = require('./router-lists.js');

const app = express();

function make_error(message)
{
    return {error: message};
}

var router = express.Router();

// Register body-parser middleware and error handler
router.use(bodyParser.json());
router.use(function(err, req, res, next) {
    if( err.type === 'entity.parse.failed' )
    {
	return res.send(make_error("invalid json in request"));
    }
    else
    {
	next();
    }
});

// Register child routers
router.use('/groups', groupsRouter);
router.use('/lists', listsRouter);

// Post-routing "middleware" to catch unimplemented methods
router.use(function(req, res, next) {
    console.log("got request for unimplemented method %s at path %s", req.method, req.originalUrl);
    return res.send(make_error("method not implemented"));
});    

// export router
module.exports = router;
    
	
