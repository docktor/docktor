'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('../errors'),
	Group = mongoose.model('Group'),
    Docker = require('dockerode'),
	_ = require('lodash');

exports.startContainer = function(req, res) {
    var group = req.group;
    var container = req.container;
    var daemonDocker = req.daemonDocker;
    console.log(container);
    console.log(daemonDocker);
    console.log('TODO');

    // TODO Get Container
    // TODO start Container, with bind and PortBindings
};

/**
 * Group middleware
 */
exports.containerById = function(req, res, next, id) {
    var containerId = req.param('containerId');
    var container = req.group.containers.id(containerId);
    if (!container) return next(new Error('Failed to load container ' + containerId));
    req.container = container;
    var daemonDocker = new Docker({protocol:container.daemon.protocol, host: container.daemon.host, port: container.daemon.port});
    req.daemonDocker = daemonDocker;
    next();
};
