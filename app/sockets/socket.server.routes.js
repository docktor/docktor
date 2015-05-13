'use strict';

/**
 * Module dependencies.
 */
var daemons = require('../controllers/daemons.server.controller.js');

module.exports = function (io) {

    io.sockets.on('connection', function(socket) {
        var statsContainerListener = daemons.statsContainer(socket);
        socket.on('container.stat.start', statsContainerListener.start);
        socket.on('container.stat.stop', statsContainerListener.stop);

        socket.on('disconnect', function() {
            statsContainerListener.stop();
        });
    });
};
