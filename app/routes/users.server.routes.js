'use strict';

/**
 * Module dependencies.
 */
var groups = require('../../app/controllers/groups.server.controller');

module.exports = function (app) {

    var users = require('../../app/controllers/users.server.controller');

    // Setting up the users profile api
    app.route('/users/me').get(users.me);

    // Setting up the users password api
    app.route('/users/password').post(users.changePassword);
    app.route('/auth/forgot').post(users.forgot);
    app.route('/auth/reset/:token').get(users.validateResetToken);
    app.route('/auth/reset/:token').post(users.reset);

    // Setting up the users authentication api
    app.route('/auth/signup').post(users.signup);
    app.route('/auth/signin').post(users.signin);
    app.route('/auth/signout').get(users.signout);

    app.route('/users/simplified').get(users.requiresLogin, users.hasAllowGrantAuthorization, users.listSimplified);
    app.route('/users/groups/:userId/:groupId').put(users.requiresLogin, users.hasAllowGrantAuthorization, users.addGroup);
    app.route('/users/groups/:userId/:groupId').delete(users.requiresLogin, users.hasAllowGrantAuthorization, users.removeGroup);
    app.route('/users/favorites/:userId/:groupId').put(users.requiresLogin, users.hasAuthorization, users.hasAllowFavoriteAuthorization, users.addFavoriteGroup);
    app.route('/users/favorites/:userId/:groupId').delete(users.requiresLogin, users.hasAuthorization, users.hasAllowFavoriteAuthorization, users.removeFavoriteGroup);

    app.route('/users/:userId')
        .get(users.requiresLogin, users.hasAuthorization, users.read)
        .put(users.requiresLogin, users.hasAuthorization, users.update)
        .delete(users.requiresLogin, users.hasAdminAuthorization, users.delete);

    app.route('/users').get(users.requiresLogin, users.hasAdminAuthorization, users.list);

    // Finish by binding the user middleware
    app.param('userId', users.userByID);
    app.param('groupId', groups.groupById);
};
