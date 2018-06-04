// By requiring this module, we make the root path of this project
// available to all required modules. This allows modules in
// subdirectories to be able to reference common files.
require('app-module-path/register');

const express = require('express');
const program = require('commander');

const config = require("config.js");
const legacyRouter = require("routers/legacy.js");
const restRouter = require("routers/rest.js");

// Define and check command-line options. 
program
    .option('--legacy', 'Use legacy POST-only API')
    .option('--rest', 'Use new REST API')
    .parse(process.argv);

if( program.legacy && program.rest )
{
    console.error("Cannot specify both legacy and REST APIs.")
}

// Load the chosen router.
const router = (program.legacy ? legacyRouter :
		program.rest ? restRouter :
		// TODO: switch the default to REST when ready
		legacy.router)

// Create the Express app and mount the chosen router.
const app = express();
app.use('/', router );

// Listen for incoming connections.
app.listen(8080, function () {
    console.log("steemcleaners api is ready to go !")
});
