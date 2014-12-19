'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    services = require('../../app/controllers/services.server.controller');

module.exports = function (app) {
    // Service Routes
    app.route('/services')
        .get(users.requiresLogin, services.hasAdminAuthorization, services.list)
        .post(users.requiresLogin, services.hasAdminAuthorization, services.create);

    app.route('/services/urlsandcommands/:serviceId/:groupId')
        .get(users.requiresLogin, services.hasAuthorization, services.getUrlsAndCommands);

    app.route('/services/:serviceId')
        .get(users.requiresLogin, services.hasAdminAuthorization, services.read)
        .put(users.requiresLogin, services.hasAdminAuthorization, services.update)
        .delete(users.requiresLogin, services.hasAdminAuthorization, services.delete);

    // Finish by binding the service middleware
    app.param('serviceId', services.serviceByID);
};
