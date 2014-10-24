'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
	nodes = require('../../app/controllers/nodes');

module.exports = function(app) {
	// Node Routes
	app.route('/nodes')
		.get(nodes.list)
		.post(users.requiresLogin, nodes.create);

	app.route('/nodes/:nodeId')
		.get(nodes.read)
		.put(users.requiresLogin, nodes.hasAuthorization, nodes.update)
		.delete(users.requiresLogin, nodes.hasAuthorization, nodes.delete);

	// Finish by binding the node middleware
	app.param('nodeId', nodes.nodeByID);
};