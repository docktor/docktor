'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Group = mongoose.model('Group'),
    Daemon = mongoose.model('Daemon'),
    Service = mongoose.model('Service'),
    _ = require('lodash');


exports.createContainer = function (req, res) {
    var group = req.group;
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var ports = {};
    var variables = [];

    // Env - A list of environment variables in the form of VAR=value
    container.variables.forEach(function (variable) {
        if (!_.isEmpty(variable.name) && !_.isEmpty(variable.value)) {
            variables.push(variable.name + '=' + variable.value);
        }
    });

    // example : ExposedPorts: {"80/tcp": {}, "22/tcp" : {}}
    container.ports.forEach(function (port) {
        if (_.isNumber(port.internal)) {
            ports[port.internal + '/' + port.protocol] = {};
        }
    });

    var containerParameters = {
        Hostname: container.hostname,
        Image: container.image,
        name: container.name,
        ExposedPorts: ports,
        Env: variables
    };

    container.parameters.forEach(function (parameter) {
        containerParameters[parameter.name] = parameter.value;
    });

    daemonDocker.createContainer(containerParameters, function (err, containerCreated) {
        if (err) {
            console.log('ERR createContainer');
            console.log(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var setToUpdate = {};
            setToUpdate['containers.$.containerId'] = containerCreated.id;
            Group.update({_id: group._id, 'containers._id': container._id},
                {$set: setToUpdate},
                function (err, numAffected) {
                    if (err || numAffected !== 1) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(containerCreated);
                    }
                });
        }
    });
};

exports.startContainer = function (req, res) {
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    var volumes = [];
    var ports = {};

    container.volumes.forEach(function (volume) {
        if (_.isString(volume.internal) && _.isString(volume.external) && !_.isEmpty(volume.internal) && !_.isEmpty(volume.external)) {
            var vol = volume.external + ':' + volume.internal;
            if (_.isString(volume.rights) && !_.isEmpty(volume.rights)) {
                vol = vol + ':' + volume.rights;
            }
            volumes.push(vol);
        }
    });

    // PortBindings : {
    //    "80/tcp": [{ "HostPort": "80" }],
    //    "22/tcp": [{ "HostPort": "22" }]
    //   }

    container.ports.forEach(function (port) {
        if (_.isNumber(port.internal) && _.isNumber(port.external)) {
            ports[port.internal + '/' + port.protocol] = [
                {'HostPort': '' + port.external + ''}
            ];
        }
    });

    dockerContainer.start({
        Binds: volumes,
        PortBindings: ports
    }, function (err, containerStarted) {
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
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.stop({}, function (err, containerStopped) {
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
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.pause({}, function (err, containerPaused) {
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
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.unpause({}, function (err, containerUnpaused) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerUnpaused);
        }
    });
};

exports.removeContainerFromGroup = function (req, res) {
    var container = req.container;
    // DO not user this : group.containers.id(container._id).remove();
    // group.containers contains only selected group...
    Group.findById(req.group._id).exec(function (err, group) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            if (!group) {
                return res.status(400).send({
                    message: 'Failed to load group ' + req.group._id
                });
            } else {
                group.containers.id(container._id).remove();
                group.save(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(container._id + ' removed from ' + group._id);
                    }
                });
            }
        }
    });

};


exports.removeContainer = function (req, res) {
    var group = req.group;
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.remove({}, function (err, containerRemoved) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            Group.resetContainerId(group._id, container._id);
            res.jsonp(containerRemoved);
        }
    });
};

exports.killContainer = function (req, res) {
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.kill(function (err, containerKilled) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(containerKilled);
        }
    });
};

exports.inspectContainer = function (req, res) {
    var group = req.group;
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.inspect(function (err, info) {
        if (err) {
            if (err.statusCode) {
                Group.resetContainerId(group._id, container._id);
            }

            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};

exports.topContainer = function (req, res) {
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);

    dockerContainer.top({ps_args: 'aux'}, function (err, info) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(info);
        }
    });
};

exports.logsContainer = function (req, res) {
    var container = req.container;
    var daemonDocker = req.daemonDocker;

    var dockerContainer = daemonDocker.getContainer(container.containerId);
    var options =
    {
        'stderr': 1,
        'stdout': 1,
        'timestamps': 1,
        'follow': 0,
        'tail': 10
    };

    dockerContainer.logs(options, function (err, stream) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var string = [];
            stream.on('data', function (buffer) {
                var part = buffer;
                string.push(part.toString());
            });
            stream.on('end', function () {
                res.jsonp(string);
            });
        }
    });
};

exports.execInContainer = function (req, res) {
    Service.getExec(req.service._id, req.params.execId).exec(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var container = req.container;
            var daemonDocker = req.daemonDocker;
            var dockerContainer = daemonDocker.getContainer(container.containerId);

            if (data[0]) {
                var command = data[0].commands.exec.split(' ');
                var options = {
                    'AttachStdout': true,
                    'AttachStderr': true,
                    'Tty': false,
                    Cmd: command
                };

                if (req.user.role !== 'admin' && data[0].commands.role === 'admin') {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage('role user not authorized to exec this command')
                    });
                } else {
                    dockerContainer.exec(options, function (err, exec) {
                        if (err) return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });

                        exec.start(function (err, stream) {
                            if (err) return;

                            var string = [];
                            stream.on('data', function (buffer) {
                                var part = buffer;
                                string.push(part.toString());
                            });
                            stream.on('end', function () {
                                res.jsonp(string);
                            });
                        });
                    });
                }
            } else {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage('No Command found')
                });
            }
        }
    });
};

/**
 * Group middleware
 */
exports.containerById = function (req, res, next, id) {
    var containerId = req.param('containerId');
    var container = req.group.containers.id(containerId);
    if (!container) return next(new Error('Failed to load container ' + containerId));
    req.group.containers = [container];
    req.container = container;

    Daemon.findById(req.container.daemonId).exec(function (err, daemon) {
        if (err) return next(err);
        if (!daemon) return next(new Error('Failed to load daemon ' + id));
        req.daemon = daemon;
        req.daemonDocker = daemon.getDaemonDocker();
        next();
    });
};
