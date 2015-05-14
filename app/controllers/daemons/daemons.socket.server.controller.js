'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Daemon = mongoose.model('Daemon'),
    Docker = require('dockerode'),
    Request = require('request'),
    Docktor = require('../../services/docktor.service.server.js'),
    _ = require('lodash');

exports.diskUsageContainer = function(socket) {
    return {
        get : function (input) {
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
                var daemonDocker = daemon.getDaemonDocker();
                var dockerContainer = daemonDocker.getContainer(input.containerId);

                var execDiskUsage = function (vol, callback) {
                    Docktor.execInContainer(
                        input.daemonId,
                        input.containerId,
                        '/usr/bin/du ' + vol + ' --max-depth=1',
                        function (err, data) {
                            if (err) {
                                callback(err, undefined);
                            }
                            if (data) {
                                var diskusage = data.split('\n');
                                diskusage.forEach(function(vol, index) {
                                    var t = vol.split('\t');
                                    if (t[0]) {
                                        diskusage[index] = {
                                            volume : t[1],
                                            diskusage :
                                                parseInt(cleanStr(t[0]))
                                        };
                                    }
                                })
                                diskusage = _.sortBy(diskusage, function(d) {
                                    return d.volume;
                                });
                                callback(undefined, diskusage);
                            }
                        }
                    );
                };

                //Call inspect to get the volumes
                daemonDocker.getContainer(input.containerId).inspect(function (err, info) {
                    if (err) {
                        return
                    } else {
                        var count = 0;
                        var total = _.keys(info.Volumes).length;
                        for (var vol in info.Volumes) {
                            var volumesUsage = [];
                            //Call /usr/bin/du
                            execDiskUsage(vol, function(err, data) {
                                count++;
                                if (data) {
                                    volumesUsage.push({volume : vol, stat : data});
                                    //On the last volume, push-it to the weksocket
                                    if (count > total - 1) {
                                        socket.emit('container.stat.volumesDiskUsage', volumesUsage);
                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                    }
                });
            });
        }
    };
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
                            var stat = JSON.parse(buffer.toString());
                            socket.emit('container.stat.data', stat);
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
            if (listener.currentStream) {
                try {
                    listener.currentStream.destroy();
                    listener.currentStream = undefined;
                } catch (err) {
                    console.error(err);
                }
            }
        }
    };
    return listener;
};

function cleanStr(str) {
    var surrogates = /[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
    str = str.replace(surrogates, function ($0) {
        return $0.length > 1 ? $0 : '\ufffd';
    });
    str = str.replace(/\u0010/g,'')
        .replace(/\u0000/g, '')
        .replace(/\u0001/g,'')
        .replace(/\u001b/g, '')
        .replace(/\u001c/g, '')
        .replace(/\u001d/g, '')
        .replace(/V/g, '')
        .replace(/=/g, '')
        .replace(/@/g, '')
        .replace(/�/g, '');
    return str;
}
