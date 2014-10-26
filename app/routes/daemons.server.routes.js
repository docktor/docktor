'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
	daemons = require('../../app/controllers/daemons');

module.exports = function(app) {
	// Daemon Routes
	app.route('/daemons')
		.get(daemons.list)
		.post(users.requiresLogin, daemons.create);

    app.route('/daemons/docker/info/:daemonId')
        .get(daemons.info);

    app.route('/daemons/docker/listContainers/:daemonId')
        .get(daemons.listContainers);

    app.route('/daemons/docker/listImages/:daemonId')
        .get(daemons.listImages);

    app.route('/daemons/:daemonId')
		.get(daemons.read)
		.put(users.requiresLogin, daemons.hasAuthorization, daemons.update)
		.delete(users.requiresLogin, daemons.hasAuthorization, daemons.delete);

	// Finish by binding the daemon middleware
	app.param('daemonId', daemons.daemonByID);
};