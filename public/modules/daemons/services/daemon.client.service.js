'use strict';

angular.module('daemons').factory('Daemon', ['DaemonsDocker',
    function (DaemonsDocker) {
        return {
            getcAdvisorUrl: function (daemon) {
                return daemon.cadvisorApi.substring(0, daemon.cadvisorApi.indexOf('/api'));

            },
            getInfo: function (id, daemon, callbackSuccess, callbackErr) {
                daemon.dockerStatus = 'checking';
                daemon.dockerStatus = 'checking';
                daemon.dockerStatusUp = false;

                DaemonsDocker.info(id).
                    success(function (info) {
                        daemon.dockerInfo = info;
                        daemon.dockerStatus = 'up';
                        daemon.dockerStatusUp = true;
                        if (callbackSuccess) callbackSuccess();
                    })
                    .error(function (resp) {
                        daemon.dockerStatus = 'down';
                        console.log('Error with Daemon.getInfoOnly on :' + daemon._id + ':');
                        console.log(resp);
                        if (callbackErr) callbackErr();
                    });
            },
            getDetails: function (daemon, callback) {
                daemon.dockerStatus = 'checking';

                this.getInfo(daemon._id, daemon, function () {
                    DaemonsDocker.version(daemon._id).
                        success(function (version) {
                            daemon.dockerVersion = version;
                        })
                        .error(function (resp) {
                            console.log('Error with DaemonsDocker.version on :' + daemon._id + ':' + resp);
                        });
                    DaemonsDocker.machineInfo(daemon._id).
                        success(function (machineInfo) {
                            daemon.machineInfo = machineInfo;
                            daemon.statsCompute = {};

                            DaemonsDocker.statsDaemon(daemon._id).
                                success(function (daemonInfo, status, headers, config) {

                                    if (daemonInfo && daemonInfo.stats) {
                                        var cur = daemonInfo.stats[daemonInfo.stats.length - 1];
                                        daemon.statsCompute = cur;
                                        var cpuUsage = 0;
                                        if (daemonInfo.spec.has_cpu && daemonInfo.stats.length >= 2) {
                                            var prev = daemonInfo.stats[daemonInfo.stats.length - 2];
                                            var rawUsage = cur.cpu.usage.total - prev.cpu.usage.total;
                                            var intervalInNs = DaemonsDocker.getInterval(cur.timestamp, prev.timestamp);
                                            // Convert to millicores and take the percentage
                                            cpuUsage = Math.round(((rawUsage / intervalInNs) / daemon.machineInfo.num_cores) * 100);
                                            if (cpuUsage > 100) {
                                                cpuUsage = 100;
                                            }
                                        }
                                        daemon.statsCompute.cpuUsagePercent = cpuUsage;

                                        if (daemonInfo.spec.has_memory) {
                                            // Saturate to the machine size.
                                            var limit = daemonInfo.spec.memory.limit;
                                            if (limit > daemon.machineInfo.memory_capacity) {
                                                limit = daemon.machineInfo.memory_capacity;
                                            }
                                            daemon.statsCompute.memoryLimit = limit;
                                            daemon.statsCompute.memoryUsage = Math.round(cur.memory.usage / 1000000);
                                            daemon.statsCompute.memoryUsagePercent = Math.round((cur.memory.usage / limit) * 100);
                                        }

                                        angular.forEach(cur.filesystem, function (fs, key) {
                                            fs.usageInMB = Number(fs.usage / (1 << 30)).toFixed(2);
                                            fs.capacityInMB = Number(fs.capacity / (1 << 30)).toFixed(2);
                                            fs.usagePercent = Number(fs.usage / fs.capacity * 100).toFixed(2);
                                        });
                                    }

                                    if (callback) callback();
                                }).
                                error(function (data, status, headers, config) {
                                    console.log('Error:');
                                    console.log(data);
                                    if (callback) callback();
                                });

                        })
                        .error(function (resp) {
                            console.log('Error with DaemonsDocker.machineInfo:' + resp);
                            if (callback) callback();
                        });
                }, function (err) {
                    console.log('Error:');
                    console.log(err);
                    if (callback) callback();
                });
            }
        };
    }
]);
