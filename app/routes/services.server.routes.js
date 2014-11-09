'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
    services = require('../../app/controllers/services');

module.exports = function (app) {
    // Service Routes
    app.route('/services')
        .get(services.list)
        .post(users.requiresLogin, services.create);

    app.route('/services/:serviceId')
        .get(services.read)
        .put(users.requiresLogin, services.hasAuthorization, services.update)
        .delete(users.requiresLogin, services.hasAuthorization, services.delete);

    // Finish by binding the service middleware
    app.param('serviceId', services.serviceByID);
};
