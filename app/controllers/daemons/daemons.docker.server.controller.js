'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors'),
    Daemon = mongoose.model('Daemon'),
    Docker = require('dockerode'),
    _ = require('lodash');

/**
 * Docker info on daemon
 */
exports.info = function(req, res) {
    var daemon = req.daemon;

    var daemonDocker = new Docker({protocol:daemon.protocol, host: daemon.host, port: daemon.port});
    daemonDocker.info(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data);
        }
    });
};
