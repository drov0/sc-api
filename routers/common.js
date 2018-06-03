const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const auth = require('steem-auth.js');
const config = require('config.js');

// Router factory; all of the routers will use merged params
function Router() {
    return express.Router({mergeParams: true});
}

// Error-handling middleware; must be added to each router
function catchErrors(err, req, res, next) {
    if (err instanceof db.NotFoundError)
	return res.status(404).send({error: err.message});
    else if (err instanceof db.AlreadyPresentError)
	return res.status(422).send({error: err.message});
    else if (err instanceof db.InvalidRecordError ||
	     err instanceof auth.BadAuthDataError)
	return res.status(400).send({error: err.message});
    else if (err instanceof auth.InvalidCredentialError)
	return res.status(401).send({error: err.message});
    else if (err instanceof auth.AccessDeniedError)
	return res.status(403).send({error: err.message});
    else
    {
	console.error(err);
	return res.status(500).send({error: "internal error",
				     message: err.message});
    }
}

// catch-all router used for invalid endpoints/methods
catchAllRouter = Router();
catchAllRouter.all(/^\/(.+)/, function(req, res, next) {
    return res.status(404).send({error: "path not found",
				 path: req.originalUrl});
});
catchAllRouter.all("/", function(req, res, next) {
    return res.status(405).send({error: "method not implemented",
				 method: req.method,
				 path: req.originalUrl});
});

// authentication middleware
async function requireAuth(req, res, next)
{
    if (!req.headers.authorization)
	throw new auth.InvalidCredentialError("this operation requires authentication");

    var parts = req.headers.authorization.split(' ');
    if (parts.length != 2)
	throw new auth.BadAuthDataError("invalid HTTP Authorization header");
    if (parts[0] !== "Basic")
	throw new auth.BadAuthDataError("invalid authentication scheme (must be \"Basic\")");

    var buffer = new Buffer.from(parts[1], 'base64');
    var decoded = buffer.toString();
    parts = decoded.split(":")
    if (parts.length != 2)
	throw new auth.BadAuthDataError("invalid Basic authentication data");

    var memoPromise = await auth.login_using_wif(parts[0], parts[1], "memo");
    var postingPromise = auth.login_using_wif(parts[0], parts[1], "posting");
    var authenticated = (await Promise.all([memoPromise, postingPromise])).includes(true);

    if (!authenticated)
	throw new InvalidCredentialError("invalid username or key (only memo/posting keys accepted)");
    if (!config.admins.includes(parts[0]))
	throw new AccessDeniedError("insufficient permissions to perform action");

    next();
}
	
module.exports = {Router,
		  catchAllRouter,
		  catchErrors,
		  requireAuth: wrap(requireAuth)}
