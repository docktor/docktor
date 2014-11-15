'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Group = mongoose.model('Group'),
    Daemon = mongoose.model('Daemon'),
    _ = require('lodash');


exports.createContainer = function (req, res) {
    var group = req.group;
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var volumes = {};
    var ports = {};
    var variables = [];

    // Env - A list of environment variables in the form of VAR=value
    container.variables.forEach(function (variable) {
        variables.push(variable.name + '=' + variable.value);
    });

    container.volumes.forEach(function (volume) {
        volumes[volume.internal] = {};
    });

    // example : ExposedPorts: {"80/tcp": {}, "22/tcp" : {}}
    container.ports.forEach(function (port) {
        ports[port.internal] = {};
    });

    daemonDocker.createContainer({
        Hostname: container.hostname,
        Image: container.image,
        name: container.name,
        Volumes: volumes,
        ExposedPorts: ports,
        CpuShares: container.cpuShares,
        Memory: container.memory,
        Env: variables
    }, function (err, containerCreated) {

        if (err) {
            console.log('ERR createContainer');
            console.log(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var setToUpdate = {};
            setToUpdate['containers.$.containerId'] = containerCreated.id;
            Group.update({_id: group._id, 'containers._id': container._id},
                {$set: setToUpdate},
                function (err, numAffected) {
                    if (err || numAffected !== 1) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(containerCreated);
                    }
                });
        }
    });
};

exports.startContainer = function (req, res) {
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    var volumes = [];
    var ports = {};

    container.volumes.forEach(function (volume) {
        volumes.push(volume.internal + ':' + volume.external);
    });

    // PortBindings : {
    //    "80/tcp": [{ "HostPort": "80" }],
    //    "22/tcp": [{ "HostPort": "22" }]
    //   }

    container.ports.forEach(function (port) {
        ports[port.internal] = [
            {'HostPort': '' + port.external + ''}
        ];
    });

    dockerContainer.start({
        Binds: volumes,
        PortBindings: ports
    }, function (err, containerStarted) {
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
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.stop({}, function (err, containerStopped) {
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
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.pause({}, function (err, containerPaused) {
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
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.unpause({}, function (err, containerUnpaused) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerUnpaused);
        }
    });
};

exports.removeContainerFromGroup = function (req, res) {
    var group = req.group;
    var container = req.container;

    group.containers.id(container._id).remove();
    group.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(container._id + ' removed from ' + group._id);
        }
    });
};


exports.removeContainer = function (req, res) {
    var group = req.group;
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.remove({}, function (err, containerRemoved) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            Group.resetContainerId(group._id, container._id);
            res.jsonp(containerRemoved);
        }
    });
};

exports.killContainer = function (req, res) {
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.kill(function (err, containerKilled) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerKilled);
        }
    });
};

exports.inspectContainer = function (req, res) {
    var group = req.group;
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.inspect(function (err, info) {
        if (err) {
            if (err.statusCode) {
                Group.resetContainerId(group._id, container._id);
            }

            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};

/**
 * Group middleware
 */
exports.containerById = function (req, res, next, id) {
    var containerId = req.param('containerId');
    var container = req.group.containers.id(containerId);
    if (!container) return next(new Error('Failed to load container ' + containerId));
    req.container = container;

    Daemon.findById(req.container.daemonId).exec(function (err, daemon) {
        if (err) return next(err);
        if (!daemon) return next(new Error('Failed to load daemon ' + id));
        req.daemon = daemon;
        req.daemonDocker = daemon.getDaemonDocker();
        next();
    });
};
