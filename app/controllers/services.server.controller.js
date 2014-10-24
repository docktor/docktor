'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Service = mongoose.model('Service'),
	_ = require('lodash');

/**
 * Create a service
 */
exports.create = function(req, res) {
	var service = new Service(req.body);
	service.user = req.user;

	service.save(function(err) {
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
exports.read = function(req, res) {
	res.jsonp(req.service);
};

/**
 * Update a service
 */
exports.update = function(req, res) {
	var service = req.service;

	service = _.extend(service, req.body);

	service.save(function(err) {
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
exports.delete = function(req, res) {
	var service = req.service;

	service.remove(function(err) {
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
 * List of Services
 */
exports.list = function(req, res) {
	Service.find().sort('-created').populate('user', 'displayName').exec(function(err, services) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(services);
		}
	});
};

/**
 * Service middleware
 */
exports.serviceByID = function(req, res, next, id) {
	Service.findById(id).populate('user', 'displayName').exec(function(err, service) {
		if (err) return next(err);
		if (!service) return next(new Error('Failed to load service ' + id));
		req.service = service;
		next();
	});
};

/**
 * Service authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.service.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};