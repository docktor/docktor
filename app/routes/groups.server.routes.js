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

    app.route('/groups/image/add')
        .get(groups.addImage)
        .post(users.requiresLogin, groups.create);

	app.route('/groups/:groupId')
		.get(groups.read)
		.put(users.requiresLogin, groups.hasAuthorization, groups.update)
		.delete(users.requiresLogin, groups.hasAuthorization, groups.delete);

	// Finish by binding the group middleware
	app.param('groupId', groups.groupByID);
};