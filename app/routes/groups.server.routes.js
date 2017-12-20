'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    groups = require('../../app/controllers/groups.server.controller');

module.exports = function (app) {

    app.route('/groups')
        .get(users.requiresLogin, groups.listGroups)
        .post(users.requiresLogin, groups.hasAdminAuthorization, groups.create);

    app.route('/groups/simplified')
        .get(users.requiresLogin, groups.listSimplified);

    app.route('/groups/jobs')
        .get(users.requiresLogin, groups.hasAdminAuthorization, groups.getJobs);

    app.route('/groups/exec/:groupId/:containerId/:serviceId/:execId/')
        .get(users.requiresLogin, groups.hasAuthorization, groups.execInContainer);

    app.route('/groups/container/freeports/:idContainer')
        .get(users.requiresLogin, groups.hasAdminAuthorization, groups.getFreePortsOnContainer);

    app.route('/groups/container/removeServiceFromGroup/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAdminAuthorization, groups.removeContainerFromGroup);

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

    app.route('/groups/container/inspect/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.inspectContainer);

    app.route('/groups/container/top/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.topContainer);

    app.route('/groups/container/logs/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.logsContainer);

    app.route('/groups/ports/free/:groupId')
        .get(users.requiresLogin, groups.hasAdminAuthorization, groups.getFreePorts);

    app.route('/groups/users/:groupId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.getUsersOnGroup);

    app.route('/groups/:groupId/:containerId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.read);

    app.route('/groups/:groupId')
        .get(users.requiresLogin, groups.hasAuthorization, groups.read)
        .put(users.requiresLogin, groups.hasAdminAuthorization, groups.update)
        .delete(users.requiresLogin, groups.hasAdminAuthorization, groups.delete);

    // Finish by binding the group middleware
    app.param('groupId', groups.groupById);
    app.param('containerId', groups.containerById);
};
