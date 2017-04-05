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

    const http = require('http');

    // Start the app using HTTPs if certifcate and private key are defined
    if (!config.httpsPrivateKey || !config.httpsCertificate) {
        http.createServer(app).listen(config.httpPort);
        console.log('Docktor application started on HTTP port ' + config.httpPort + '. (no certificate or private key defined for HTTPS)');
    } else {
        const fs = require('fs');
        const https = require('https');
        const privateKey = config.httpsPrivateKey ? fs.readFileSync(config.httpsPrivateKey, 'utf8') : undefined;
        const certificate = config.httpsCertificate ? fs.readFileSync(config.httpsCertificate, 'utf8') : undefined;
        const credentials = { key: privateKey, cert: certificate };

        const express = require('express');
        const redirectApp = express();
        const redirectServer = http.createServer(redirectApp);

        redirectApp.use(function requireHTTPS(req, res, next) {
            if (!req.secure) {
                const host = req.headers.host || "localhost:" + config.httpPort
                const hostSplit = host.split(':');
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

