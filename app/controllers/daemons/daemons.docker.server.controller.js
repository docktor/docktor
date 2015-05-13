'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Daemon = mongoose.model('Daemon'),
    Docker = require('dockerode'),
    Request = require('request'),
    _ = require('lodash');

exports.infos = function (req, res) {

    var daemonInfos = {};
    req.daemonDocker.info(function (err, dataInfo) {
        if (err) {
            errorHandler.emitMessage(req, {
                title: 'Error',
                type: 'WARNING',
                message: 'ERR: Cannot connect docker daemon ' + req.daemon.name
            });
            res.send(errorHandler.getErrorMessage(err));
        } else {
            daemonInfos.info = dataInfo;
            if (daemonInfos.info) {
                req.daemonDocker.version(function (err, dataVersion) {
                    daemonInfos.version = dataVersion;
                    if (req.daemon.cadvisorApi) {
                        new Request(req.daemon.cadvisorApi + '/machine', function (err, response, machineInfo) {
                            if (err) {
                                daemonInfos.machineInfo = errorHandler.getErrorMessage(err);
                            } else {
                                daemonInfos.machineInfo = machineInfo;
                            }
                            res.send(daemonInfos);
                        });
                    } else {
                        res.send(daemonInfos);
                    }
                });
            } else {
                res.send(daemonInfos);
            }
        }
    });

};


/**
 * List containers of one docker daemon.
 */
exports.listContainers = function (req, res) {
    req.daemonDocker.listContainers({'all': 1}, function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data);
        }
    });
};

exports.inspectContainer = function (req, res) {
    req.containerDocker.inspect(function (err, info) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};


exports.statsContainer = function(socket) {
    var listener = {
        currentStream : {},
        start : function (input) {
            Daemon.findById(input.daemonId).exec(function (err, daemon) {
                if (err) {
                    socket.emit('container.stat.error', err);
                    return err;
                }
                if (!daemon) {
                    err = new Error('Failed to load daemon ' + input.daemonId);
                    socket.emit('container.stat.error', err);
                    return err;
                }
                //Confirm start on the socket
                socket.emit('container.stat.start');
                var daemonDocker = daemon.getDaemonDocker();
                var dockerContainer = daemonDocker.getContainer(input.containerId);
                //Call docker stats remote API
                dockerContainer.stats(function (err, stream) {
                    //Save reference to the stream to ensure, we will able to close it later
                    listener.currentStream = stream;
                    //Close the stream after 5 minutes
                    setTimeout(function(){
                        socket.emit('container.stat.timeout');
                        listener.stop();
                    }, 5*60*1000);
                    if (err) {
                        var error = new Error('Failed to load daemon ' + input.daemonId);
                        socket.emit('container.stat.error', error);
                        return error;
                    } else {
                        //On each data got form the remote api, push it to the socket
                        stream.on('data', function (buffer) {
                            var part = buffer;
                            console.log(JSON.parse(part.toString()));
                            socket.emit('container.stat.data', JSON.parse(part.toString()));
                        });
                        stream.on('end', function () {
                            listener.currentStream = undefined;
                            socket.emit('container.stat.stop');
                        });
                    }
                });
            });
        },
        stop : function () {
            console.log('Stop Stats Container from socket ' + socket.id);
            //Destroy the stream to stop long-polling on the socket
            if (listener.currentStream){
                listener.currentStream.destroy();
                listener.currentStream = undefined;
            }
        }
    };
    return listener;
};

exports.startContainer = function (req, res) {
    req.containerDocker.start({}, function (err, containerStarted) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerStarted);
        }
    });
};

exports.stopContainer = function (req, res) {
    req.containerDocker.stop({}, function (err, containerStopped) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerStopped);
        }
    });
};

exports.pauseContainer = function (req, res) {
    req.containerDocker.pause({}, function (err, containerPaused) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerPaused);
        }
    });
};

exports.unpauseContainer = function (req, res) {
    req.containerDocker.unpause({}, function (err, containerUnpaused) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerUnpaused);
        }
    });
};

exports.killContainer = function (req, res) {
    req.containerDocker.kill({}, function (err, container) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(container);
        }
    });
};

exports.removeContainer = function (req, res) {
    req.containerDocker.remove({}, function (err, container) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(container);
        }
    });
};

exports.killContainer = function (req, res) {
    req.containerDocker.kill(function (err, container) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.send(container);
        }
    });
};

exports.statsDeamon = function (req, res) {
    new Request(req.daemon.cadvisorApi + '/containers/', function (err, response, body) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.send(body);
        }
    });
};


/**
 * List images of one docker daemon.
 */
exports.listImages = function (req, res) {
    req.daemonDocker.listImages(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data);
        }
    });
};

exports.inspectImage = function (req, res) {
    req.imageDocker.inspect(function (err, info) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};

exports.pullImage = function (req, res) {
    req.daemonDocker.pull(req.body.name, function (err, stream) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var string = [];
            stream.on('data', function (buffer) {
                var part = buffer;
                string.push(JSON.parse(part.toString()));
            });
            stream.on('end', function () {
                res.jsonp(string);
            });
        }
    });
};

exports.removeImage = function (req, res) {
    req.imageDocker.remove({}, function (err, info) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};

/**
 * Daemon middleware
 * id : docker container Id
 */
exports.containerDocker = function (req, res, next, id) {
    req.containerDocker = req.daemonDocker.getContainer(id);
    next();
};

exports.imageDocker = function (req, res, next, id) {
    req.imageDocker = req.daemonDocker.getImage(id);
    next();
};
