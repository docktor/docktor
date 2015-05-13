'use strict';

var  socketIO = require('socket.io'),
     http = require('http'),
     sticky = require('sticky-session');

module.exports = function (app) {
    var server = http.createServer(app);
    var io = socketIO.listen(server);

    var users = {};
    var sockets = {};

    io.sockets.on('connection', function (socket) {
        socket.emit('who are you');
        socket.on('check in', function (input) {
            if (input.user) {
                console.log(input.user._id + " Connected to websocket " + socket.id);
                users[input.user._id] = socket.id;
                sockets[socket.id] = input.user._id;
            }
        });
        socket.on('disconnect', function() {
            var user_id = sockets[socket.id];
            console.log(user_id + " Disconnected from websocket " + socket.id);
            users[user_id] = undefined;
        });
    });

    app.set('socketio', io);
    app.set('server', server);
    app.set('users', users);

    app.use(function(req, res, next) {
        req.users = users;
        req.sockets = sockets;
        next();
    });

    return io;
};
