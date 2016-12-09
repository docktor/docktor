'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Daemon = mongoose.model('Daemon'),
    Group = mongoose.model('Group'),
    _ = require('lodash');


/**
 * Create a daemon
 */
exports.create = function (req, res) {
	console.log(req);
    var daemon = new Daemon(req.body);
    daemon.user = req.user;
    daemon.site = req.body.site;
    daemon.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(daemon);
        }
    });
};

/**
 * Show the current daemon
 */
exports.read = function (req, res) {
    var daemon = req.daemon;
    //Security issue : hide certificate and key when the user is not admin
    if (req.user.role !== 'admin') {
        daemon.cert = undefined;
        daemon.ca = undefined;
        daemon.key = undefined;
    }
    res.jsonp(daemon);
};

/**
 * Update a daemon
 */
exports.update = function (req, res) {
    var daemon = req.daemon;
    daemon = _.extend(daemon, req.body);
    daemon.site = req.body.site;
    daemon.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(daemon);
        }
    });
};

/**
 * Delete an daemon
 */
exports.delete = function (req, res) {
    var daemon = req.daemon;

    daemon.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(daemon);
        }
    });
};

/**
 * List of Daemons
 */
exports.list = function (req, res) {
    Daemon.find().sort('name')
        .populate('site')
        .populate('user', 'displayName')
        .exec(function (err, daemons) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                daemons.forEach(function (daemon){
                    daemon.cert = undefined;
                    daemon.ca = undefined;
                    daemon.key = undefined;
                });
                res.jsonp(daemons);
            }
        });
};

/**
 * Daemon middleware
 */
exports.daemonByID = function (req, res, next, id) {
    Daemon.findById(id).populate('site').populate('user', 'displayName').exec(function (err, daemon) {
        if (err) return next(err);
        if (!daemon) return next(new Error('Failed to load daemon ' + id));
        req.daemon = daemon;
        req.daemonDocker = daemon.getDaemonDocker();
        next();
    });
};

/**
 * Daemon authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {

    Group.getGroupsOfOneDaemon(req.daemon._id.toString()).exec(function (err, data) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var userAssociatedToGroup = false;
                if (req.user.role !== 'admin') {
                    data[0].groupIds.forEach(function (groupId) {
                        if (!userAssociatedToGroup) {
                            req.user.groups.forEach(function (userGroupId) {
                                if (groupId.toString === userGroupId.toString) {
                                    userAssociatedToGroup = true;
                                    return;
                                }
                            });
                        }
                        if (userAssociatedToGroup) return false;
                    });

                    if (!userAssociatedToGroup) {
                        return res.status(403).send({
                            message: 'User is not authorized (user - groups)'
                        });
                    }
                }
                next();
            }
        }
    );

};

exports.hasAdminAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send({
            message: 'User is not authorized (no Admin - groups)'
        });
    }
    next();
};
