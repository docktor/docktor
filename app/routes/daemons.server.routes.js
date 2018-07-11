'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    daemons = require('../../app/controllers/daemons.server.controller');

module.exports = function (app) {

    app.route('/daemons')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.list)
        .post(users.requiresLogin, daemons.hasAdminAuthorization, daemons.create);

    app.route('/daemons/docker/infos/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.infos);

    app.route('/daemons/docker/listContainers/:daemonId')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.listContainers);

    app.route('/daemons/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.read)
        .put(users.requiresLogin, daemons.hasAdminAuthorization, daemons.update)
        .delete(users.requiresLogin, daemons.hasAdminAuthorization, daemons.delete);

    app.route('/daemons/docker/container/inspect/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.inspectContainer);

    app.route('/daemons/docker/container/start/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.startContainer);

    app.route('/daemons/docker/container/stop/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.stopContainer);

    app.route('/daemons/docker/container/remove/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.removeContainer);

    app.route('/daemons/docker/stats/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.statsDeamon);

    app.route('/daemons/docker/listImages/:daemonId')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.listImages);

    app.route('/daemons/docker/image/remove/:daemonId/:imageDockerId')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.removeImage);

    app.route('/daemons/docker/image/inspect/:daemonId/:imageDockerId')
        .get(users.requiresLogin, daemons.hasAdminAuthorization, daemons.inspectImage);

    app.route('/daemons/docker/image/pull/:daemonId')
        .post(users.requiresLogin, daemons.hasAdminAuthorization, daemons.pullImage);

    // Finish by binding with middleware
    app.param('daemonId', daemons.daemonByID);
    app.param('containerDockerId', daemons.containerDocker);
    app.param('imageDockerId', daemons.imageDocker);

};
