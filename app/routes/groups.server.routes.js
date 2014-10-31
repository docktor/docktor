'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
	groups = require('../../app/controllers/groups');

module.exports = function(app) {
	// Group Routes
	app.route('/groups')
		.get(groups.list)
		.post(users.requiresLogin, groups.create);

    app.route('/groups/container/create/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.createContainer);

    app.route('/groups/container/start/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.startContainer);

    app.route('/groups/container/stop/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.stopContainer);

    app.route('/groups/container/pause/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.pauseContainer);

    app.route('/groups/container/unpause/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.unpauseContainer);

    app.route('/groups/container/remove/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.removeContainer);

    app.route('/groups/container/kill/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.killContainer);

	app.route('/groups/:groupId')
		.get(groups.read)
		.put(users.requiresLogin, groups.hasAuthorization, groups.update)
		.delete(users.requiresLogin, groups.hasAuthorization, groups.delete);

	// Finish by binding the group middleware
	app.param('groupId', groups.groupById);
	app.param('containerId', groups.containerById);
};