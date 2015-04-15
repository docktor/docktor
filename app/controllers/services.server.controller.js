'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Service = mongoose.model('Service'),
    Group = mongoose.model('Group'),
    Daemon = mongoose.model('Daemon'),
    scheduler = require('../../config/scheduler'),
    async = require('async'),
    _ = require('lodash');

/**
 * Create a service
 */
exports.create = function (req, res) {
    var service = new Service(req.body);
    service.user = req.user;

    service.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(service);
        }
    });
};

/**
 * Show the current service
 */
exports.read = function (req, res) {
    var service = req.service.toObject();
    var daemons = [];

    var daemonWorker = function (daemon,callback){
        var d = {
            name: daemon.name,
            id: daemon._id,
            dockerImage: undefined,
            online: false
        };

        var docker = daemon.getDaemonDocker();
        docker.listImages(function (err, data) {
            if (err) {
                callback(err);
            }
            if (data) {
                d.online = true;

                service.images.forEach(function(image) {

                    image.daemons.push(d);
                    data.forEach(function (dockerImage) {
                        if (dockerImage.RepoTags.indexOf(image.name) > -1) {
                            d.dockerImage = dockerImage;
                        }
                    });
                });
                callback();
            }
        });
    };

    var queueDaemon = async.queue(daemonWorker, 4);

    Daemon.find().exec(function (exec, data) {
        daemons = data;
        if (!service.images || service.images.length === 0 || daemons.length ===0) {
            res.jsonp(service);
        } else {
            service.images.forEach(function(image) {
                image.daemons = [];
            });
            daemons.forEach(function (daemon) {
                queueDaemon.push(daemon);
            });
        }
    });

    queueDaemon.drain = function () {
        res.jsonp(service);
    };
};


/**
 * Update a service
 */
exports.update = function (req, res) {
    var service = req.service;

    service = _.extend(service, req.body);

    service.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(service);
        }
    });
};

/**
 * Delete an service
 */
exports.delete = function (req, res) {
    var service = req.service;

    Group.getGroupsOfOneService(service._id.toString()).exec(function (err, data) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            if (data && data[0] && data[0].groups.length > 0) {
                var titles = '';
                data[0].groups.forEach(function (group) {
                    titles += ' ' + group.title;
                });
                return res.status(400).send({
                    message: errorHandler.getErrorMessage('Some group(s) (' + titles + ' ) are using this service. Please remove this service from them before delete it')
                });
            } else {
                service.remove(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(service);
                    }
                });
            }
        }
    });
};

/**
 * List of Services
 */
exports.list = function (req, res) {
    Service.find({}).sort('-created').populate('user', 'displayName').exec(function (err, services) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(services);
        }
    });
};

exports.listSimplified = function (req, res) {
    Service.listSimplified().exec(function (err, services) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(services);
        }
    });
};

exports.getUrlsAndCommands = function (req, res) {
    console.log(req.service.commands);
    console.log(req.service.urls);
    res.jsonp({'commands': req.service.commands, 'urls': req.service.urls});
};

exports.activateJob = function (req, res) {
    scheduler.activateJob(req.body.job, req.service._id, function () {
        res.jsonp({msg: 'End Activate job'});
    }, function (err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

exports.desactivateJob = function (req, res) {
    scheduler.desactivateJob(req.params.jobId, function (numRemoved) {
        res.jsonp({msg: 'End Desactivate job (' + numRemoved + ' removed)'});
    });
};

exports.pullImage = function (req, res) {
    //Retrieve service with only the requested image
    Service.findOne({'images._id': req.body.imageId}, {'images.$': 1}, function (err, service) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else if (service) {
                //Retrieve the daemon
                Daemon.findById(req.body.daemonId).exec(function (err, daemon) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else if (daemon) {
                        var daemonDocker = daemon.getDaemonDocker();
                        //Call the docker pull command
                        console.log('*** Pulling the image ***');
                        daemonDocker.pull(service.images[0].name, function (err, stream) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                //Getting buffered events
                                var string = [];
                                stream.on('data', function (buffer) {
                                    var part = buffer;
                                    string.push(JSON.parse(part.toString()));
                                });
                                stream.on('end', function () {
                                    console.dir(string);
                                    console.log('*** done ***');
                                    err = _.find(string, function (s) {
                                        return s.error;
                                    });
                                    if (err) {
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err.error)
                                        });
                                    } else {

                                        res.jsonp(string);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    );
};

/**
 * Service middleware
 */
exports.serviceByID = function (req, res, next, id) {
    Service.findById(id).populate('user', 'displayName').exec(function (err, service) {
        if (err) return next(err);
        if (!service) return next(new Error('Failed to load service ' + id));
        req.service = service;
        next();
    });
};

/**
 * Service authorization middleware
 */
exports.hasAdminAuthorization = function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send({
            message: 'User is not authorized (no Admin - services)'
        });
    }
    next();
};

exports.hasAuthorization = function (req, res, next) {
    var userAssociatedToGroup = false;
    req.user.groups.forEach(function (userGroupId) {
        if (req.group._id.toString() === userGroupId.valueOf().toString()) {
            userAssociatedToGroup = true;
            return;
        }
    });
    if (req.user.role !== 'admin' && !userAssociatedToGroup) {
        return res.status(403).send({
            message: 'User is not authorized (no Admin - services)'
        });
    }
    next();
};
