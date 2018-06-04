const express = require('express');
const wrap = require('express-async-handler');

const db = require('db.js');
const auth = require('steem-auth.js');
const config = require('config.js');

// Router factory; all of the routers will use merged params.
function Router() {
    return express.Router({mergeParams: true});
}

// Error-handling middleware; must be added to the end of each router.
function catchErrors(err, req, res, next) {
    // 404 Not Found -- self-explanatory
    if (err instanceof db.NotFoundError)
	return res.status(404).send({error: err.message});
    // 422 Unprocessable Entity -- suggested here: https://stackoverflow.com/a/3826091
    else if (err instanceof db.AlreadyPresentError)
	return res.status(422).send({error: err.message});
    // 400 Bad Request -- used for various types of malformed requests
    else if (err instanceof db.InvalidRecordError ||
	     err instanceof auth.BadAuthDataError)
	return res.status(400).send({error: err.message});
    // 401 Unauthorized -- valid credentials are required but not provided
    else if (err instanceof auth.InvalidCredentialError)
	return res.status(401).send({error: err.message});
    // 403 Forbidden -- valid credentials are provided for unprivileged user
    else if (err instanceof auth.AccessDeniedError)
	return res.status(403).send({error: err.message});
    // All other errors will be treated as 500 Internal Server Error and
    // debug information will be printed. This is also a good way to discover
    // new client-side errors we should be catching.
    else {
	console.error(err);
	return res.status(500).send({error: "internal error",
				     message: err.message});
    }
}

// Catch-all router used for invalid endpoints/methods.
catchAllRouter = Router();

// First look for anything after the slash. If the client is attempting
// to get to a child router but one does not exist, that's a 404.
catchAllRouter.all(/^\/(.+)/, function(req, res, next) {
    return res.status(404).send({error: "path not found",
				 path: req.originalUrl});
});

// If the client gets to this point, it means they're requesting
// this router's endpoint, but for an undefined method. For this,
// we return 405 Method Not Allowed.
catchAllRouter.all("/", function(req, res, next) {
    return res.status(405).send({error: "method not implemented",
				 method: req.method,
				 path: req.originalUrl});
});

// Authentication middleware. This will ensure that the client has
// provided a valid HTTP Authorization header. Should be placed in
// the middleware chain directly before the handler for the method
// it is protecting.
async function requireAuth(req, res, next)
{
    // If there is no Authorization header, fail.
    if (!req.headers.authorization)
	throw new auth.InvalidCredentialError("this operation requires authentication");

    // Validate the received Authorization header. Currently, only Basic authentication
    // is supported, which requires that the private posting or memo key be passed.
    //
    // A good improvement would be to do something like JSON Web Tokens
    // (see https://jwt.io), but using the Steem memo key to sign the token. This way,
    // the server would not have to be trusted with the key.
    var parts = req.headers.authorization.split(' ');
    if (parts.length != 2)
	throw new auth.BadAuthDataError("invalid HTTP Authorization header");
    if (parts[0] !== "Basic")
	throw new auth.BadAuthDataError("invalid authentication scheme (must be \"Basic\")");

    // Convert the Base64 Basic authentication bundle into its parts (user and key).
    var buffer = new Buffer.from(parts[1], 'base64');
    var decoded = buffer.toString();
    parts = decoded.split(":")
    if (parts.length != 2)
	throw new auth.BadAuthDataError("invalid Basic authentication data");

    // Asynchronously try the key as both a memo and a posting key. This allows us
    // to skip asking the client what kind of key they're using, which is nice.
    var memoPromise = await auth.login_using_wif(parts[0], parts[1], "memo");
    var postingPromise = auth.login_using_wif(parts[0], parts[1], "posting");
    var authenticated = (await Promise.all([memoPromise, postingPromise])).includes(true);

    // If both Steem authentications failed, fail.
    if (!authenticated)
	throw new InvalidCredentialError("invalid username or key (only memo/posting keys accepted)");

    // If Steem authentication succeeded, but the user is not privileged, fail.
    if (!config.admins.includes(parts[0]))
	throw new AccessDeniedError("insufficient permissions to perform action");

    // Move on to the next middleware.
    next();
}

module.exports = {Router,
		  catchAllRouter,
		  catchErrors,
		  // requireAuth is pre-wrapped for convenience.
		  requireAuth: wrap(requireAuth)}
