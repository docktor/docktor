'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = require('../../models/user.server.model');


/**
 * Delete a User
 */
exports.delete = function (req, res) {
    var user = req.profile;

    user.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(user);
        }
    });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
    User.find().populate('groups').exec(function (err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(users);
        }
    });
};

/**
 * Update user details
 */
exports.update = function (req, res) {
    // Init Variables
    var user = req.profile;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    if (req.user._id === req.profile._id) {
        delete req.body.role;
    }
    delete req.body.password;
    delete req.body.salt;

    if (user) {
        // Merge existing user
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (req.user._id === req.profile._id) {
                    req.login(user, function (err) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            res.jsonp(user);
                        }
                    });
                } else { // edit a user from an admin
                    res.jsonp(user);
                }
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

/**
 * Show user
 */
exports.read = function (req, res) {
    res.jsonp(req.profile);
};


/**
 * Send User
 */
exports.me = function (req, res) {
    res.jsonp(req.user || null);
};

/**
 * Site authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin' && req.user._id !== req.profile._id) {
        return res.status(403).send({
            message: 'User is not authorized (user - users)'
        });
    }
    next();
};

exports.hasAdminAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send({
            message: 'User is not authorized (no Admin - users)'
        });
    }
    next();
};

