'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
    config = require('./config/config'),
    mongoose = require('mongoose'),
    scheduler = require('./config/scheduler'),
    cluster = require('cluster'),
    os = require('os');


// Code to run if we're in the master process
if (config.cluster && cluster.isMaster) {
    // Count the machine's CPUs
    var cpuCount = os.cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Code to run if we're in a worker process
} else {

    // Bootstrap db connection
    var db = mongoose.connect(config.db, function (err) {
        if (err) {
            console.error('\x1b[31m', 'Could not connect to MongoDB!');
            console.log(err);
        }
    });

    scheduler.start();

    // Init the express application
    var app = require('./config/express')(db);

    // Bootstrap passport config
    require('./config/passport')();

    var http = require('http');

    // Start the app using HTTPs if certifcate and private key are defined
    if (!config.httpsPrivateKey || !config.httpsCertificate) {
        http.createServer(app).listen(config.httpPort);
        console.log('Docktor application started on HTTP port ' + config.httpPort + '. (no certificate or private key defined for HTTPS)');
    } else {
        var fs = require('fs');
        var https = require('https');
        var privateKey = config.httpsPrivateKey ? fs.readFileSync(config.httpsPrivateKey, 'utf8') : undefined;
        var certificate = config.httpsCertificate ? fs.readFileSync(config.httpsCertificate, 'utf8') : undefined;
        var credentials = { key: privateKey, cert: certificate };

        var express = require('express');
        var redirectApp = express();
        var redirectServer = http.createServer(redirectApp);

        redirectApp.use(function requireHTTPS(req, res, next) {
            if (!req.secure) {
                var host = req.headers.host || "localhost:" + config.httpPort
                var hostSplit = host.split(':');
                console.log('redirect to https://' + hostSplit[0] + ':' + config.httpsPort + req.url)
                return res.redirect('https://' + hostSplit[0] + ':' + config.httpsPort + req.url);
            }
            next();
        })
        redirectServer.listen(config.httpPort);

        https.createServer(credentials, app).listen(config.httpsPort);
        console.log('Docktor application started on HTTPs port ' + config.httpsPort);

    }

    // Expose app
    exports = module.exports = app;

}

