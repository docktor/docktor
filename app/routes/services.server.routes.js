'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    services = require('../../app/controllers/services.server.controller');

module.exports = function (app) {

    app.route('/services')
        .get(users.requiresLogin, services.hasAdminAuthorization, services.list)
        .post(users.requiresLogin, services.hasAdminAuthorization, services.create);

    app.route('/services/simplified')
        .get(users.requiresLogin, services.hasAdminAuthorization, services.listSimplified);

    app.route('/services/jobs/activate/:serviceId/:jobId')
        .put(users.requiresLogin, services.hasAdminAuthorization, services.activateJob);

    app.route('/services/jobs/desactivate/:serviceId/:jobId')
        .delete(users.requiresLogin, services.hasAdminAuthorization, services.desactivateJob);

    app.route('/services/urlsandcommands/:serviceId/:groupId')
        .get(users.requiresLogin, services.hasAuthorization, services.getUrlsAndCommands);

    app.route('/services/:serviceId')
        .get(users.requiresLogin, services.hasAdminAuthorization, services.read)
        .put(users.requiresLogin, services.hasAdminAuthorization, services.update)
        .delete(users.requiresLogin, services.hasAdminAuthorization, services.delete);

    // Finish by binding the service middleware
    app.param('serviceId', services.serviceByID);
};
