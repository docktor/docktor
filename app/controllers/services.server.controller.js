'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Service = mongoose.model('Service'),
    Group = mongoose.model('Group'),
    Daemon = mongoose.model('Daemon'),
    scheduler = require('../../config/scheduler'),
    _ = require('lodash');

/**
 * Create a service
 */
exports.create = function (req, res) {
    var service = new Service(req.body);
    service.user = req.user;

    service.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(service);
        }
    });
};

/**
 * Show the current service
 */
exports.read = function (req, res) {
    var service = req.service.toObject();
    service.daemons = [];

    Daemon.find().exec(function(err, daemons){
        daemons.forEach(function(daemon, idxDaemon){
            var lastDaemon = (idxDaemon === daemons.length -1);
            var docker = daemon.getDaemonDocker();
            console.log('Searching ' + service.title + ' on daemon ' + daemon.name);
            var d = {
                name: daemon.name,
                id: daemon._id
            };
            d.images = [];
            service.images.forEach(function(image, idxImage) {
                var lastImage = (idxImage === service.images.length -1);
                var serviceImage = {
                    name: image.name,
                    id: image._id,
                    dockerImage: undefined
                };
                docker.listImages(function(err, data) {
                    data.forEach(function(dockerImage) {
                        if (dockerImage.RepoTags.indexOf(image.name) > -1) {
                            serviceImage.dockerImage = dockerImage;
                        }
                    });
                    d.images.push(serviceImage);

                    if (lastImage) {
                        service.daemons.push(d);
                    }
                    if (lastDaemon) {
                        res.jsonp(service);
                    }
                });
            });

        });
    });
};

/**
 * Update a service
 */
exports.update = function (req, res) {
    var service = req.service;

    service = _.extend(service, req.body);

    service.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(service);
        }
    });
};

/**
 * Delete an service
 */
exports.delete = function (req, res) {
    var service = req.service;

    Group.getGroupsOfOneService(service._id.toString()).exec(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            if (data && data[0] && data[0].groups.length > 0) {
                var titles = '';
                data[0].groups.forEach(function (group) {
                    titles += ' ' + group.title;
                });
                return res.status(400).send({
                    message: errorHandler.getErrorMessage('Some group(s) (' + titles + ' ) are using this service. Please remove this service from them before delete it')
                });
            } else {
                service.remove(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(service);
                    }
                });
            }
        }
    });
};

/**
 * List of Services
 */
exports.list = function (req, res) {
    Service.find({}).sort('-created').populate('user', 'displayName').exec(function (err, services) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(services);
        }
    });
};

exports.listSimplified = function (req, res) {
    Service.listSimplified().exec(function (err, services) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(services);
        }
    });
};

exports.getUrlsAndCommands = function (req, res) {
    res.jsonp({'commands': req.service.commands, 'urls': req.service.urls});
};

exports.activateJob = function (req, res) {
    scheduler.activateJob(req.body.job, req.service._id, function () {
        res.jsonp({msg: 'End Activate job'});
    }, function (err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

exports.desactivateJob = function (req, res) {
    scheduler.desactivateJob(req.params.jobId, function (numRemoved) {
        res.jsonp({msg: 'End Desactivate job (' + numRemoved + ' removed)'});
    });
};

/**
 * Service middleware
 */
exports.serviceByID = function (req, res, next, id) {
    Service.findById(id).populate('user', 'displayName').exec(function (err, service) {
        if (err) return next(err);
        if (!service) return next(new Error('Failed to load service ' + id));
        req.service = service;
        next();
    });
};

/**
 * Service authorization middleware
 */
exports.hasAdminAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send({
            message: 'User is not authorized (no Admin - services)'
        });
    }
    next();
};

exports.hasAuthorization = function (req, res, next) {
    var userAssociatedToGroup = false;
    req.user.groups.forEach(function (userGroupId) {
        if (req.group._id.toString() === userGroupId.valueOf().toString()) {
            userAssociatedToGroup = true;
            return;
        }
    });
    if (req.user.role !== 'admin' && !userAssociatedToGroup) {
        return res.status(403).send({
            message: 'User is not authorized (no Admin - services)'
        });
    }
    next();
};
