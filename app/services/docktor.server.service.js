'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Daemon = mongoose.model('Daemon'),
    Docker = require('dockerode'),
    Request = require('request'),
    Async = require('async'),
    _ = require('lodash');

/**
 * Return a boolean value representing if the docker daemon is up or not
 * @param daemonId
 */
var isDockerDaemonUp = function (daemonId, callbackEnd) {
    //Prepare the status
    var status;
    var messages = [];


    //Prepare the async worker
    var pingWorker = function (pingData, workerCallback) {
        if (pingData.err) {
            console.log('ERR: Cannot ping docker daemon ' + daemonId);
            messages.push({
                title: 'Error',
                type : 'WARNING',
                message: 'ERR: Cannot ping docker daemon ' + daemonId
            });
            status = false;
            return workerCallback();
        } else if (pingData.data) {
            status = true;
            return workerCallback();
        } else {
            messages.push({
                title: 'Error',
                type : 'WARNING',
                message: 'ERR: Cannot ping docker daemon ' + daemonId
            });
            status = false;
            return workerCallback();
        }
    };

    //Prepare the async queue
    var q = Async.queue(pingWorker, 1);

    q.drain = function () {
        callbackEnd({
            status : status,
            messages : messages
        });
    };


    //Load the daemon
    Daemon.findById(daemonId).exec(function (err, daemon) {
        if (err) {
            messages.push({
                title: 'Error',
                type : 'WARNING',
                message: 'ERR: Cannot load docker daemon ' + daemonId
            });
        } else if (!daemon) {
            messages.push({
                title: 'Error',
                type : 'WARNING',
                message: 'ERR: Cannot load docker daemon ' + daemonId
            });
        } else {
            //Get the docker wrapper
            var daemonDocker = daemon.getDaemonDocker();

            //Prepare the ping callback which will feed the queue
            var pingCallback = function (err, data) {
                q.push({err: err, data: data});
            };

            //Call the ping
            daemonDocker.ping(pingCallback);
        }
    });

};

/**
 *
 * @param daemonId
 * @param containerId
 * @param callback
 */
var isContainerRunning = function (daemonId, containerId, fCallback) {
    //Load the daemon
    Daemon.findById(daemonId).exec(function (err, daemon) {
        if (err) {
            console.err(err);
            return fCallback(false);
        } else if (!daemon) {
            console.err('Failed to load daemon ' + daemonId);
            return fCallback(false);
        } else {
            //Get the docker wrapper
            var daemonDocker = daemon.getDaemonDocker();

            var inspectCallback = function (err, data) {
                if (err) {
                    return fCallback(false);
                } else if (!data) {
                    return fCallback(false);
                } else {
                    if (data.State.Running) {
                        return fCallback(true);
                    } else {
                        return fCallback(false);
                    }
                }
            };

            //Call the inspect
            daemonDocker.getContainer(containerId).inspect(inspectCallback);
        }
    });

};

module.exports = {
    isDockerDaemonUp: isDockerDaemonUp,
    isContainerRunning: isContainerRunning
};
