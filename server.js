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

    // Start the app by listening on <port>
    app.get('server').listen(config.port);

    // Logging initialization
    console.log('Docktor application started on port ' + config.port);
}

