'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
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
    User.find().exec(function (err, users) {
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
 * List all users with displayName only
 * @param req Request
 * @param res Response
 */
exports.listSimplified = function (req, res) {
    User.find({}, 'displayName').exec(function (err, users) {
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

exports.addGroup = function (req, res) {
    var userToUpdate = req.profile;
    var groupToAdd = req.group;

    User.getUsersOfOneGroup(groupToAdd._id).exec(function (err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            // Add group on user 
            var query = { '$push': { 'groups': groupToAdd._id } };
            if (users && users.length === 0) {
                // Allow grant on user when he's the first contact to be added in group. 
                query.allowGrant = true;
            }
            User.update({ '_id': userToUpdate._id }, query, function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.status(200).send('OK');
                }
            });

        }
    });

};

var removeFavoriteGroup = function (req, res) {
    var userToUpdate = req.profile;
    var groupToRemove = req.group;
    User.update({ '_id': userToUpdate._id }, { '$pull': { 'favorites': groupToRemove._id } }, function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.status(200).send('OK');
        }
    });
};

exports.removeFavoriteGroup = removeFavoriteGroup;

exports.removeGroup = function (req, res) {
    var userToUpdate = req.profile;
    var groupToRemove = req.group;

    User.update({ '_id': userToUpdate._id }, { '$pull': { 'groups': groupToRemove._id } }, function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            removeFavoriteGroup(req, res);
        }
    });
};

exports.addFavoriteGroup = function (req, res) {
    var userToUpdate = req.profile;
    var groupToAdd = req.group;

    User.update({ '_id': userToUpdate._id }, { '$push': { 'favorites': groupToAdd._id } }, function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.status(200).send('OK');
        }
    });

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
    User.findOne({ _id: req.user._id }).populate('favorites', 'title').exec(function (err, user) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        if (!user) {
            return res.status(400).send({
                message: 'Failed to load User'
            });
        } else {
            res.jsonp(user || null);
        }
    });
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

exports.hasAllowGrantAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin') {
        if (req.user.allowGrant === false) {
            return res.status(403).send({
                message: 'User is not authorized (allowGrant false - users)'
            });
        } else {
            if (req.group && !_.find(req.user.groups, req.group._id)) {
                return res.status(403).send({
                    message: 'User is not authorized (not in group)'
                });
            }
        }
    }
    next();
};

exports.hasAllowFavoriteAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin') {
        if (req.group && !_.find(req.user.groups, req.group._id)) {
            return res.status(403).send({
                message: 'User is not authorized (not in group)'
            });
        }
    }
    next();
};

