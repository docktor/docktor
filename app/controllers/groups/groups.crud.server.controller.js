'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * Create a group
 */
exports.create = function (req, res) {
    var group = new Group(req.body);
    group.user = req.user;

    group.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(group);
        }
    });
};


/**
 * Show the current group
 */
exports.read = function (req, res) {
    res.jsonp(req.group);
};

exports.getUsersOnGroup = function (req, res) {
    var group = req.group;
    User.getUsersOfOneGroup(group._id).exec(function (err, data) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (data[0] && data[0].users && data[0].users.length > 0) {
                    res.jsonp(data[0].users);
                } else {
                    res.jsonp([]);
                }
            }
        }
    );
};

/**
 * Update a group
 */
exports.update = function (req, res) {
    var group = req.group;

    group = _.extend(group, req.body);

    group.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(group);
        }
    });
};

/**
 * Delete an group
 */
exports.delete = function (req, res) {
    var group = req.group;

    if (group.containers && group.containers.length > 0) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage('Please remove all services on group before delete it.')
        });
    } else {
        group.remove(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(group);
            }
        });
    }
};

exports.getFreePortsOnContainer = function (req, res) {
    var containerId = req.param('idContainer');
    Group.find().where('daemon')
        .equals(containerId)
        .exec(function (err, groups) {
            if (err) {
                return res.status(400)
                    .send({
                        message: errorHandler.getErrorMessage(err)
                    });
            } else {
                var usedPortRange = [];
                for (var i = 0; i < groups.length; i++) {
                    usedPortRange.push(groups[i].portminrange + '->' + groups[i].portmaxrange);
                }
                res.jsonp(usedPortRange);
            }
        });
};

exports.getFreePorts = function (req, res) {
    Group.getUsedPorts(req.group._id).exec(function (err, data) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var freePorts = [];
                if (_.isNumber(req.group.portminrange) && _.isNumber(req.group.portmaxrange)) {
                    for (var port = req.group.portminrange; port <= req.group.portmaxrange; port++) {
                        if (!data[0] || !data[0].usedPorts) {
                            freePorts.push(port);
                        } else if (!_.contains(data[0].usedPorts, port)) {
                            freePorts.push(port);
                        }

                    }
                }
                res.jsonp(freePorts);
            }
        }
    );
};

/**
 * List of Groups
 */
exports.listGroups = function (req, res) {
    var where = {'_id': {'$in': req.user.groups}};
    if (req.user.role === 'admin') {
        where = {};
    }

    Group.find(where).sort('title').populate('daemon').exec(function (err, groups) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(groups);
        }
    });
};

/**
 * Group middleware
 */
exports.groupById = function (req, res, next, id) {
    Group.findById(id).populate('user', 'displayName').populate('daemon').exec(function (err, group) {
        if (err) return next(err);
        if (!group) return next(new Error('Failed to load group ' + id));
        req.group = group;
        next();
    });

};

/**
 * Group authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin' && _.contains(req.user.groups, req.group._id)) {
        return res.status(403).send({
            message: 'User is not authorized (user - groups)'
        });
    }
    next();
};

exports.hasAdminAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send({
            message: 'User is not authorized (no Admin - groups)'
        });
    }
    next();
};
