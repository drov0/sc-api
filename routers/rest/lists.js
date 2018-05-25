const express = require('express');

const db = require('db.js');
const common = require('routers/common.js');

const router = common.Router();

router.use(common.catchErrors);
router.use(common.catchAllRouter);

// export router
module.exports = router;
