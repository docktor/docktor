'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Daemon = mongoose.model('Daemon'),
    _ = require('lodash');


/**
 * Create a daemon
 */
exports.create = function (req, res) {
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
    res.jsonp(req.daemon);
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
    Daemon.find().sort('-created').populate('user', 'displayName').exec(function (err, daemons) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(daemons);
        }
    });
};

/**
 * Daemon middleware
 */
exports.daemonByID = function (req, res, next, id) {
    Daemon.findById(id).populate('user', 'displayName').populate('site').exec(function (err, daemon) {
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
    if (req.daemon.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};
