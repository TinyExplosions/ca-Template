// App Dynamics code. See documentation for keys/naming conventions
if ((process.env.FH_ENV === "ist-prod" || process.env.ENABLE_APPDYNAMICS === "true") && process.env.APPD_ACCESS_KEY) {
    require("appdynamics").profile({
        controllerHostName: 'bp.saas.appdynamics.com',
        controllerPort: 443,
        controllerSslEnabled: true,
        libagent: true,
        accountName: 'bp',
        accountAccessKey: process.env.APPD_ACCESS_KEY,
        applicationName: '<APPLICATION NAME>',
        tierName: '<TIER NAME>',
        nodeName: '<NODE NAME>'
    });
}
var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var Logger = require('fh-logger-helper');
var appDetail = require('./package.json');

// list the endpoints which you want to make securable via RHMAP here
var securableEndpoints;
securableEndpoints = ['/hello'];

var app = express();
// remove the 'x-powered-by: express header'
app.disable('x-powered-by');

// Enable CORS for all requests
app.use(cors());
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header('Api-Version', appDetail.version);
    next();
});

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

app.use(require('express-api-check')());
app.get('/login', function(req, res) {
    return res.redirect(process.env.AZURE_AUTH);
});

// Everything below this will require authentication
app.use(require('rhmap-aad-auth')());

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

app.use('/hello', require('./lib/hello.js')());
app.use('/proxy', require('./lib/proxy.js')());


// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, host, function() {
    Logger.sys(appDetail.name, appDetail.version, "started at: " + new Date() + " on port: " + port);
});