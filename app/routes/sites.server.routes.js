'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    sites = require('../../app/controllers/sites.server.controller');

module.exports = function (app) {
    // Site Routes
    app.route('/sites')
        .get(sites.list)
        .post(users.requiresLogin, sites.create);

    app.route('/sites/:siteId')
        .get(sites.read)
        .put(users.requiresLogin, sites.hasAuthorization, sites.update)
        .delete(users.requiresLogin, sites.hasAuthorization, sites.delete);

    // Finish by binding the site middleware
    app.param('siteId', sites.siteByID);
};
