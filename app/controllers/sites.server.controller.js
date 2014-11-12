'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Site = mongoose.model('Site'),
    _ = require('lodash');

/**
 * Create a site
 */
exports.create = function (req, res) {
    var site = new Site(req.body);

    site.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(site);
        }
    });
};

/**
 * Show the current site
 */
exports.read = function (req, res) {
    res.jsonp(req.site);
};

/**
 * Update a site
 */
exports.update = function (req, res) {
    var site = req.site;

    site = _.extend(site, req.body);

    site.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(site);
        }
    });
};

/**
 * Delete an site
 */
exports.delete = function (req, res) {
    var site = req.site;

    site.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(site);
        }
    });
};

/**
 * List of Sites
 */
exports.list = function (req, res) {
    Site.find().sort('-created').exec(function (err, sites) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(sites);
        }
    });
};

/**
 * Site middleware
 */
exports.siteByID = function (req, res, next, id) {
    Site.findById(id).exec(function (err, site) {
        if (err) return next(err);
        if (!site) return next(new Error('Failed to load site ' + id));
        req.site = site;
        next();
    });
};

/**
 * Site authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    //TODO
    next();
};
