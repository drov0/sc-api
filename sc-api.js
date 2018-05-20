const express = require('express');
const program = require('commander');

const config = require("./config.js");
const legacy = require("./router-legacy.js");
const rest = require("./router-root.js");

program
    .option('--legacy', 'Use legacy POST-only API')
    .option('--rest', 'Use new REST API')
    .parse(process.argv);

if( program.legacy && program.rest )
{
    console.error("Cannot specify both legacy and REST APIs.")
}

const router = (program.legacy ? legacy.router :
		program.rest ? rest.router :
		// TODO: switch the default to REST when ready
		legacy.router)

const app = express();

app.use('/', router );

app.listen(8080, function () {
    console.log("steemcleaners api is ready to go !")
});
