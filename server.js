'use strict';
/**
 * Module dependencies.
 */
const init = require('./config/init')(),
    config = require('./config/config'),
    mongoose = require('mongoose'),
    scheduler = require('./config/scheduler'),
    cluster = require('cluster'),
    os = require('os');


// Code to run if we're in the master process
if (config.cluster && cluster.isMaster) {
    // Count the machine's CPUs
    const cpuCount = os.cpus().length;

    // Create a worker for each CPU
    for (const i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

// Code to run if we're in a worker process
} else {

    // Bootstrap db connection
    const db = mongoose.connect(config.db, function (err) {
        if (err) {
            console.error('\x1b[31m', 'Could not connect to MongoDB!');
            console.log(err);
        }
    });

    scheduler.start();

    // Init the express application
    const app = require('./config/express')(db);

    // Bootstrap passport config
    require('./config/passport')();

    // Start the app by listening on <port>
    const https = require('https');
    const http = require('http');

    const fs = require('fs');
    const privateKey = fs.readFileSync('/path/to/certs/key.pem', 'utf8');
    const certificate = fs.readFileSync('/path/to/certs/cert.pem', 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    const express = require('express');
    const redirectApp = express();
    const redirectServer = http.createServer(redirectApp);

    redirectApp.use(function requireHTTPS(req, res, next) {
        if (!req.secure) {
            const host = req.headers.host || "localhost:" + config.port
            const hostSplit = host.split(':');
            console.log('redirect to https://' + hostSplit[0] + ':' + config.port + req.url)
            return res.redirect('https://' + hostSplit[0] + ':' + config.port + req.url);
        }
        next();
    })
    redirectServer.listen(3001);

    https.createServer(credentials, app).listen(config.port);

    // Expose app
    exports = module.exports = app;

    // Logging initialization
    console.log('Docktor application started on port ' + config.port);
}

