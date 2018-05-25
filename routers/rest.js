const express = require('express');
const bodyParser = require('body-parser');

const common = require('routers/common.js');

const groupsRouter = require('./rest/groups.js');
const listsRouter = require('./rest/lists.js');

const app = express();

function make_error(message)
{
    return {error: message};
}

var router = common.Router();

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

router.use(common.catchAllRouter);

// export router
module.exports = router;
    
	
