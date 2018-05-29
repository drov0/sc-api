const express = require('express');
const wrap = require('express-async-handler');    

const db = require('db.js');
const common = require('routers/common.js');

const router = common.Router();

// TODO: GET, PUT and DELETE

router.use(common.catchErrors);
router.use(common.catchAllRouter);

// export router
module.exports = {router};
