const express = require('express');

const config = require("./config.js");

const {router} = require("./router-legacy.js");

const app = express();

// this will be switched to the new router when ready
app.use('/', router);

app.listen(8080, function () {
    console.log("steemcleaners api is ready to go !")
});
