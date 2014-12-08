'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    sites = require('../../app/controllers/sites.server.controller');

module.exports = function (app) {
    // Site Routes
    app.route('/sites')
        .get(users.requiresLogin, sites.hasAdminAuthorization, sites.list)
        .post(users.requiresLogin, sites.hasAdminAuthorization, sites.create);

    app.route('/sites/:siteId')
        .get(users.requiresLogin, sites.hasAdminAuthorization, sites.read)
        .put(users.requiresLogin, sites.hasAdminAuthorization, sites.update)
        .delete(users.requiresLogin, sites.hasAdminAuthorization, sites.delete);

    // Finish by binding the site middleware
    app.param('siteId', sites.siteByID);
};
