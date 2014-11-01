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
exports.info = function (req, res) {
    req.daemonDocker.info(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data);
        }
    });
};

/**
 * List containers of one docker daemon.
 */
exports.listContainers = function (req, res) {
    req.daemonDocker.listContainers({'all': 1}, function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data);
        }
    });
};

exports.inspectContainer = function (req, res) {
    req.containerDocker.inspect(function (err, info) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};

exports.startContainer = function (req, res) {
    req.containerDocker.start({}, function (err, containerStarted) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerStarted);
        }
    });
};

exports.stopContainer = function (req, res) {
    req.containerDocker.stop({}, function (err, containerStopped) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerStopped);
        }
    });
};

exports.pauseContainer = function (req, res) {
    req.containerDocker.pause({}, function (err, containerPaused) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerPaused);
        }
    });
};

exports.unpauseContainer = function (req, res) {
    req.containerDocker.unpause({}, function (err, containerUnpaused) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerUnpaused);
        }
    });
};

exports.removeContainer = function (req, res) {
    req.containerDocker.remove({}, function (err, container) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(container);
        }
    });
};

exports.killContainer = function (req, res) {
    req.containerDocker.kill(function (err, container) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(container);
        }
    });
};


/**
 * List images of one docker daemon.
 */
exports.listImages = function (req, res) {
    var daemon = req.daemon;

    var daemonDocker = new Docker({protocol: daemon.protocol, host: daemon.host, port: daemon.port});
    daemonDocker.listImages(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data);
        }
    });
};

/**
 * Daemon middleware
 */
exports.containerDocker = function (req, res, next, id) {
    req.containerDocker = req.daemonDocker.getContainer(id);
    next();
};