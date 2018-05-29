const express = require('express');
const wrapAsync = require('express-async-handler');

const db = require('db.js');

function Router() {
    return express.Router({mergeParams: true});
}

function catchErrors(err, req, res, next) {
    if (err instanceof db.NotFoundError)
	return res.status(404).send({error: err.message});
    else if (err instanceof db.AlreadyPresentError)
	return res.status(422).send({error: err.message});
    else if (err instanceof db.InvalidRecordError)
	return res.status(400).send({error: err.message});
    else
    {
	console.error(err);
	return res.status(500).send({error: "internal error",
				     message: err.message});
    }
}

catchAllRouter = Router();

catchAllRouter.all(/^\/(.+)/, function(req, res, next) {
    return res.status(404).send({error: "not found",
				 path: req.originalUrl});
});

catchAllRouter.all("/", function(req, res, next) {
    return res.status(504).send({error: "method not implemented",
				 method: req.method,
				 path: req.originalUrl});
});

module.exports = {Router, catchAllRouter, catchErrors}
