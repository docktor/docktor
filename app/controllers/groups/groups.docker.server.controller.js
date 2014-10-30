'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors'),
    Group = mongoose.model('Group'),
    Docker = require('dockerode'),
    _ = require('lodash');


exports.createContainer = function (req, res) {
    var group = req.group;
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var volumes = {};
    var ports = {};

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
        ExposedPorts: ports
    }, function (err, containerCreated) {

        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var setToUpdate = {};
            setToUpdate['containers.$.containerId'] = containerCreated.id;
            Group.update({_id: group._id, 'containers._id': container._id},
                {$set: setToUpdate},
                function (err, numAffected) {
                    if (err || numAffected != 1) {
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
            { 'HostPort': '' + port.external + ''}
        ];
    });

    dockerContainer.start({
        Binds: volumes,
        PortBindings: ports
    }, function (err, containerStarted) {
        if (err) {s
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

/**
 * Group middleware
 */
exports.containerById = function (req, res, next, id) {
    var containerId = req.param('containerId');
    var container = req.group.containers.id(containerId);
    if (!container) return next(new Error('Failed to load container ' + containerId));
    req.container = container;
    var daemonDocker = new Docker({protocol: container.daemon.protocol, host: container.daemon.host, port: container.daemon.port});
    req.daemonDocker = daemonDocker;
    next();
};
