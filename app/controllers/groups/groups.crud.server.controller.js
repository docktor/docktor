'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Group = mongoose.model('Group'),
    Daemon = mongoose.model('Daemon'),
    Service = mongoose.model('Service'),
    Docker = require('dockerode'),
    User = require('../../models/user.server.model'),
    async = require('async'),
    Docktor = require('../../services/docktor.server.service'),
    _ = require('lodash');

/**
 * Create a group
 */
exports.create = function (req, res) {
    var group = new Group(req.body);
    group.user = req.user;

    group.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(group);
        }
    });
};


/**
 * Show the current group
 */
exports.read = function (req, res) {
    // Documents returned by Mongoose are not JSON objects directly,
    var group = req.group.toObject();
    // you'll need to convert them to an object to add properties to them
    // http://stackoverflow.com/questions/14768132/add-a-new-attribute-to-existing-json-object-in-node-s

    //If there is not containers, return
    if (!group.containers || group.containers.length === 0) {
        res.jsonp(group);
    }

    //Helpful function to get the container object on the group from a container name
    var getConcernedContainer = function (cName) {
        var concernedContainer = _.find(group.containers, function (container) {
            return container.name === cName;
        });
        return concernedContainer;
    };

    //Defining queues
    var queueDaemons, queueContainers;

    // This worker will be called for every daemon pushed to the daemonQueue
    // For every daemon, call docker ps
    // For every container running on the container,
    // push the container to the containerQueue
    var daemonWorker = function (daemon, callback) {
        //console.log('Processing daemon ' + daemon.name);
        var daemonDocker = daemon.getDaemonDocker();
        //Call "docker ps"
        daemonDocker.listContainers(function (err, data) {
            //For every container running ons this daemon
            if (data && data.length !== 0) {
                data.forEach(function (c) {
                    queueContainers.push(c);
                });
            }
            if (err) {
                console.error(err);
                return callback();
            } else {
                return callback();
            }
        });
    };

    // This worker will be called for every container pushed to the queue
    // For every running container,
    // find the container object from the group and find the service
    var containerWorker = function (container, callback) {
        var concernedContainer = getConcernedContainer(container.Names[0]);
        //Retrieve the service
        if (concernedContainer) {
            Service.findById(concernedContainer.serviceId).exec(function (err, service) {
                if (!err && service) {
                    var paused = container.Status.indexOf('Paused') > -1;
                    //Overriding docker inspect
                    concernedContainer.inspect = {
                        State: {
                            Running: true,
                            Paused: paused
                        }
                    };
                    concernedContainer.commands = service.commands;
                    concernedContainer.urls = service.urls;
                    callback();
                } else {
                    return callback(err);
                }
            });
        } else {
            return callback();
        }
    };

    //Defining queues
    queueDaemons = async.queue(daemonWorker, 2);
    queueContainers = async.queue(containerWorker, 10);

    //drain function will be called when the last item from the queue has returned from the worker
    var drainQueues = function () {
        //Waiting the last of the 2 workers queues to return de response
        if (queueDaemons.idle() && queueContainers.idle()) {
            res.jsonp(group);
        }
    };
    queueDaemons.drain = drainQueues;
    queueContainers.drain = drainQueues;

    //Main part. Getting the list of concerned Daemon, from the list of the container of the group
    var listDaemonIds = [];
    group.containers.forEach(function (container) {
        if (listDaemonIds.indexOf(container.daemonId) === -1) listDaemonIds.push(container.daemonId);
    });
    //Main part. For every daemon.
    listDaemonIds.forEach(function (daemonId) {
        //Loading daemon from database
        Daemon.findById(daemonId).exec(function (err, daemon) {
            //Push the dameon to the queue and start the magic !
            queueDaemons.push(daemon);
        });
    });
};

exports.getUsersOnGroup = function (req, res) {
    var group = req.group;
    User.getUsersOfOneGroup(group._id).exec(function (err, data) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (data[0] && data[0].users && data[0].users.length > 0) {
                    res.jsonp(data[0].users);
                } else {
                    res.jsonp([]);
                }
            }
        }
    );
};

/**
 * Update a group
 */
exports.update = function (req, res) {
    var group = req.group;

    group = _.extend(group, req.body);

    group.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(group);
        }
    });
};

/**
 * Delete an group
 */
exports.delete = function (req, res) {
    var group = req.group;

    if (group.containers && group.containers.length > 0) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage('Please remove all services on group before delete it.')
        });
    } else {
        group.remove(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(group);
            }
        });
    }
};

exports.getJobs = function (req, res) {
    Group.getJobs().exec(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data);
        }
    });
};

exports.getFreePortsOnContainer = function (req, res) {
    var containerId = req.params.idContainer;
    Group.find().where('daemon')
        .equals(containerId)
        .exec(function (err, groups) {
            if (err) {
                return res.status(400)
                    .send({
                        message: errorHandler.getErrorMessage(err)
                    });
            } else {
                var usedPortRange = [];
                for (var i = 0; i < groups.length; i++) {
                    usedPortRange.push(groups[i].portminrange + '->' + groups[i].portmaxrange);
                }
                res.jsonp(usedPortRange);
            }
        });
};

exports.getFreePorts = function (req, res) {
    Group.getUsedPorts(req.group._id).exec(function (err, data) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var freePorts = [];
                if (_.isNumber(req.group.portminrange) && _.isNumber(req.group.portmaxrange)) {
                    for (var port = req.group.portminrange; port <= req.group.portmaxrange; port++) {
                        if (!data[0] || !data[0].usedPorts) {
                            freePorts.push(port);
                        } else if (!_.contains(data[0].usedPorts, port)) {
                            freePorts.push(port);
                        }

                    }
                }
                res.jsonp(freePorts);
            }
        }
    );
};

/**
 * List of Groups
 */
exports.listGroups = function (req, res) {
    var where = {'_id': {'$in': req.user.groups}};
    if (req.user.role === 'admin') {
        where = {};
    }
    var groupsResponse = [];

    var checkDaemonIsUpWorker = function (data, callback) {
        Docktor.isDockerDaemonUp(data.container.daemonId, function (status) {
            if (status) {
                data.groupResponse.runningDaemons.push(data.container.daemonId);
            }
            return callback();
        });
    };

    var checkContainerIsUpWorker = function (data, callback) {
        Docktor.isContainerRunning(data.container.daemonId, data.container.containerId, function(status){
            console.log(status);
            if (status) {
                data.groupResponse.runningContainers.push(data.container.containerId);
            }
            return callback();
        });
    };

    var qDaemons = async.queue(checkDaemonIsUpWorker, 10);
    var qContainers = async.queue(checkContainerIsUpWorker, 10);

    var drainFunction = function () {
        if (qDaemons.idle() && qContainers.idle()) {
            console.log('All items have been processed');
            res.jsonp(groupsResponse);
        }
    };
    qDaemons.drain = drainFunction;
    qContainers.drain = drainFunction;

    Group.find(where).sort('title').populate('daemon', '-ca -cert -key').exec(function (err, groups) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            groups.forEach(function (group) {
                var groupResponse = {
                    _id: group._id,
                    title: group.title,
                    description: group.description,
                    created: group.created,
                    daemons: [],
                    runningDaemons: [],
                    containers: [],
                    runningContainers: []
                };

                group.containers.forEach(function (container) {
                    var responseContainer = {
                        name: container.name,
                        image: container.image,
                        id: container.containerId
                    };
                    groupResponse.containers.push(responseContainer);
                    //Add to queue to check container status
                    qContainers.push({groupResponse: groupResponse, container: container});

                    if (groupResponse.daemons.indexOf(container.daemonId) === -1) {
                        groupResponse.daemons.push(container.daemonId);
                        //Add to queue to check daemon status
                        qDaemons.push({groupResponse: groupResponse, container: container});
                    }
                });

                groupsResponse.push(groupResponse);
            });
        }
    });
};

exports.listSimplified = function (req, res) {
    Group.listSimplified().exec(function (err, groups) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(groups);
        }
    });
};

/**
 * Group middleware
 */
exports.groupById = function (req, res, next, id) {
    Group.findById(id).populate('user', 'displayName').populate('daemon', '-ca -cert -key').exec(function (err, group) {
        if (err) return next(err);
        if (!group) return next(new Error('Failed to load group ' + id));
        req.group = group;
        next();
    });
};

/**
 * Group authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    // contains not work _.contains(req.user.groups, req.group._id)
    if (req.user.role !== 'admin' && _.where(req.user.groups, req.group._id).length <= 0) {
        return res.status(403).send({
            message: 'User is not authorized (user - groups)'
        });
    } else {
        next();
    }
};

exports.hasAdminAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send({
            message: 'User is not authorized (no Admin - groups)'
        });
    } else {
        next();
    }
};
