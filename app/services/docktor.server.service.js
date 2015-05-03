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
exports.isDockerDaemonUp = function (daemonId, callback) {
    //Prepare the status
    var status;

    //Prepare the async worker
    var pingWorker = function(pingData, callback) {
        if (pingData.err) {
            console.log('ERR: Cannot ping docker daemon ' + daemonId);
            console.error(pingData.err);
            status = false;
            return callback();
        } else if (pingData.data) {
            status = true;
            return callback();
        } else {
            status = false;
            return callback();
        }
    };

    //Prepare the async queue
    var q = Async.queue(pingWorker, 1);

    q.drain = function() {
        callback(status);
    };


    //Load the daemon
    Daemon.findById(daemonId).exec(function (err, daemon) {
        if (err) {
            throw err;
        } else if (!daemon) {
            throw new Error('Failed to load daemon ' + daemonId);
        }

        //Get the docker wrapper
        var daemonDocker = daemon.getDaemonDocker();

        //Prepare the ping callback which will feed the queue
        var pingCallback = function(err, data) {
            q.push({err: err, data: data});
        };

        //Call the ping
        daemonDocker.ping(pingCallback);
    });

};

exports.isContainerRunning = function(daemonId, containerId, callback) {
    //Load the daemon
    Daemon.findById(daemonId).exec( function (err, daemon) {
        if (err) {
            console.err(err);
            return callback(false);
        } else if (!daemon) {
            console.err('Failed to load daemon ' + daemonId);
            return callback(false);
        } else {
            //Get the docker wrapper
            var daemonDocker = daemon.getDaemonDocker();

            //Prepare the ping callback which will feed the queue
            var inspectCallback = function (err, data) {
                console.log("** inspectCallback **");
                console.log(err);
                console.log(data);
                if (err) {
                    return callback(false);
                } else if (!data) {
                    return callback(false);
                } else {
                    console.log("###########");
                    console.log(data);
                    if (data.State.Running) {
                        return callback(true);
                    } else {
                        return callback(false);
                    }
                }
            };

            //Call the inspect
            daemonDocker.getContainer(containerId).inspect(inspectCallback);
        }
    });

}
