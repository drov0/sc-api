const express = require('express');
const wrapAsync = require('express-async-handler');

function Router() {
    return express.Router({mergeParams: true});
}

function catchAll(req, res, next) {
    return res.status(504).send({error: "method not implemented"})
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

module.exports = {Router, catchAllRouter}
