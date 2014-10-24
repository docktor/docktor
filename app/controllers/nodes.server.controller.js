'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Node = mongoose.model('Node'),
	_ = require('lodash');

/**
 * Create a node
 */
exports.create = function(req, res) {
	var node = new Node(req.body);
	node.user = req.user;

	node.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(node);
		}
	});
};

/**
 * Show the current node
 */
exports.read = function(req, res) {
	res.jsonp(req.node);
};

/**
 * Update a node
 */
exports.update = function(req, res) {
	var node = req.node;

	node = _.extend(node, req.body);

	node.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(node);
		}
	});
};

/**
 * Delete an node
 */
exports.delete = function(req, res) {
	var node = req.node;

	node.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(node);
		}
	});
};

/**
 * List of Nodes
 */
exports.list = function(req, res) {
	Node.find().sort('-created').populate('user', 'displayName').exec(function(err, nodes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(nodes);
		}
	});
};

/**
 * Node middleware
 */
exports.nodeByID = function(req, res, next, id) {
	Node.findById(id).populate('user', 'displayName').exec(function(err, node) {
		if (err) return next(err);
		if (!node) return next(new Error('Failed to load node ' + id));
		req.node = node;
		next();
	});
};

/**
 * Node authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.node.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};