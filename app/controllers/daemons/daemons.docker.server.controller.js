'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Daemon = mongoose.model('Daemon'),
    Docker = require('dockerode'),
    Request = require('request'),
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

exports.version = function (req, res) {
    req.daemonDocker.version(function (err, data) {
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
            res.send(container);
        }
    });
};


exports.statsContainer = function (req, res) {
    new Request(req.daemon.cadvisorApi + '/containers/docker/' + req.containerDocker.id, function (err, response, body) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.send(body);
        }
    });
};


exports.statsDeamon = function (req, res) {
    new Request(req.daemon.cadvisorApi + '/containers/', function (err, response, body) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.send(body);
        }
    });
};

exports.machineInfo = function (req, res) {
    new Request(req.daemon.cadvisorApi + '/machine', function (err, response, body) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.send(body);
        }
    });
};


/**
 * List images of one docker daemon.
 */
exports.listImages = function (req, res) {
    req.daemonDocker.listImages(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data);
        }
    });
};

exports.inspectImage = function (req, res) {
    req.imageDocker.inspect(function (err, info) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};

exports.pullImage = function (req, res) {
    req.daemonDocker.pull(req.body.name, function (err, stream) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var string = [];
            stream.on('data', function (buffer) {
                var part = buffer;
                string.push(JSON.parse(part.toString()));
            });
            stream.on('end', function () {
                res.jsonp(string);
            });
        }
    });
};

exports.removeImage = function (req, res) {
    req.imageDocker.remove({}, function (err, info) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};

/**
 * Daemon middleware
 * id : docker container Id
 */
exports.containerDocker = function (req, res, next, id) {
    req.containerDocker = req.daemonDocker.getContainer(id);
    next();
};

exports.imageDocker = function (req, res, next, id) {
    req.imageDocker = req.daemonDocker.getImage(id);
    next();
};
