'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Service = mongoose.model('Service'),
    Group = mongoose.model('Group'),
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
    res.jsonp(req.service);
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

    console.log('REQ ON ');
    console.log(service._id);
    var result = Group.getGroupsOfOneService(service._id.toString()).exec(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            console.log('data:');
            console.log(data);
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
    Service.find().sort('-created').populate('user', 'displayName').exec(function (err, services) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(services);
        }
    });
};

exports.getCommands = function (req, res) {
    res.jsonp(req.service.commands);
};

exports.getUrls = function (req, res) {
    res.jsonp(req.service.urls);
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
