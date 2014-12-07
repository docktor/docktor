'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    daemons = require('../../app/controllers/daemons.server.controller');

module.exports = function (app) {
    // Daemon Routes
    app.route('/daemons')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.list)
        .post(users.requiresLogin, daemons.hasAuthorization, daemons.create);

    app.route('/daemons/docker/info/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.info);

    app.route('/daemons/docker/version/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.version);

    app.route('/daemons/docker/listContainers/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.listContainers);

    app.route('/daemons/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.read)
        .put(users.requiresLogin, daemons.hasAuthorization, daemons.update)
        .delete(users.requiresLogin, daemons.hasAuthorization, daemons.delete);

    app.route('/daemons/docker/container/inspect/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.inspectContainer);

    app.route('/daemons/docker/container/start/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.startContainer);

    app.route('/daemons/docker/container/stop/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.stopContainer);

    app.route('/daemons/docker/container/pause/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.pauseContainer);

    app.route('/daemons/docker/container/unpause/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.unpauseContainer);

    app.route('/daemons/docker/container/kill/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.killContainer);

    app.route('/daemons/docker/container/remove/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.removeContainer);

    app.route('/daemons/docker/container/stats/:daemonId/:containerDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.statsContainer);

    app.route('/daemons/docker/stats/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.statsDeamon);

    app.route('/daemons/docker/machineInfo/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.machineInfo);

    app.route('/daemons/docker/listImages/:daemonId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.listImages);

    app.route('/daemons/docker/image/remove/:daemonId/:imageDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.removeImage);

    app.route('/daemons/docker/image/inspect/:daemonId/:imageDockerId')
        .get(users.requiresLogin, daemons.hasAuthorization, daemons.inspectImage);

    app.route('/daemons/docker/image/pull/:daemonId')
        .post(users.requiresLogin, daemons.hasAuthorization, daemons.pullImage);

    // Finish by binding with middleware
    app.param('daemonId', daemons.daemonByID);
    app.param('containerDockerId', daemons.containerDocker);
    app.param('imageDockerId', daemons.imageDocker);

};
