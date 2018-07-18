var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');
var Logger = require('fh-logger-helper');
var proxyRoot = 'http://example.com';

function proxy() {
	Logger.info("In Proxy route");
    var routes = new express.Router();
    routes.use(function(req, res) {
        var proxyUrl = proxyRoot + req.path;
        Logger.info("Redirecting", req.path, "to", proxyUrl);
        request(proxyUrl).pipe(res);
    });

    return routes;
}

module.exports = proxy;
