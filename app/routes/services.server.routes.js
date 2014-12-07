'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    services = require('../../app/controllers/services.server.controller');

module.exports = function (app) {
    // Service Routes
    app.route('/services')
        .get(users.requiresLogin, services.hasAuthorization, services.list)
        .post(users.requiresLogin, services.hasAuthorization, services.create);

    app.route('/services/commands/:serviceId')
        .get(users.requiresLogin, services.hasAuthorization, services.getCommands);

    app.route('/services/urls/:serviceId')
        .get(users.requiresLogin, services.hasAuthorization, services.getUrls);

    app.route('/services/:serviceId')
        .get(users.requiresLogin, services.hasAuthorization, services.read)
        .put(users.requiresLogin, services.hasAuthorization, services.update)
        .delete(users.requiresLogin, services.hasAuthorization, services.delete);

    // Finish by binding the service middleware
    app.param('serviceId', services.serviceByID);
};
