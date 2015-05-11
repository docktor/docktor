'use strict';

var socketIO = require('socket.io');
var http = require('http');

module.exports = function (app) {
    var server = http.createServer(app);
    var io = socketIO.listen(server);

    var users = {};

    io.sockets.on('connection', function (socket) {
        socket.emit('who are you');
        socket.on('check in', function (input) {
            if (input.user) {
                console.dir(input.user);
                console.log(input.user._id + " Connected to websocket " + socket.id);
                users[input.user._id] = socket.id;
            }
        });
    });

    app.set('socketio', io);
    app.set('server', server);
    app.set('users', users);

    app.use(function(req, res, next) {
        console.log("users -> " + users);
        req.users = users;
        next();
    });

    return;
};
