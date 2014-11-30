'use strict';

angular.module('daemons').factory('Daemon', ['DaemonsDocker',
    function (DaemonsDocker) {
        return {
            getcAdvisorUrl: function (daemon) {
                return daemon.cadvisorApi.substring(0, daemon.cadvisorApi.indexOf('/api'));

            },
            getInfo: function (id, daemon, callbackSuccess) {
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
                        console.log('Error with Daemon.getInfoOnly on :' + daemon._id + ':' + resp);
                    });
            },
            getDetails: function (daemon) {
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
                            daemon.stats = {};

                            DaemonsDocker.statsDaemon(daemon._id).
                                success(function (daemonInfo, status, headers, config) {
                                    daemonInfo.stats = daemonInfo.stats;

                                    var cur = daemonInfo.stats[daemonInfo.stats.length - 1];
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
                                    daemon.stats.cpuUsagePercent = cpuUsage;

                                    if (daemonInfo.spec.has_memory) {
                                        // Saturate to the machine size.
                                        var limit = daemonInfo.spec.memory.limit;
                                        if (limit > daemon.machineInfo.memory_capacity) {
                                            limit = daemon.machineInfo.memory_capacity;
                                        }
                                        daemon.stats.memoryLimit = limit;
                                        daemon.stats.memoryUsage = Math.round(cur.memory.usage / 1000000);
                                        daemon.stats.memoryUsagePercent = Math.round((cur.memory.usage / limit) * 100);
                                    }

                                    daemon.stats.filesystemsCompute = [];
                                    angular.forEach(cur.filesystem, function (fs, key) {
                                        fs.usageInMB = Number(fs.usage / (1 << 30)).toFixed(2);
                                        fs.capacityInMB = Number(fs.capacity / (1 << 30)).toFixed(2);
                                        fs.usagePercent = Number(fs.usage / fs.capacity * 100).toFixed(2);
                                        daemon.stats.filesystemsCompute.push(fs);
                                    });
                                }).
                                error(function (data, status, headers, config) {
                                    console.log('Error:');
                                    console.log(data);
                                });

                        })
                        .error(function (resp) {
                            console.log('Error with DaemonsDocker.machineInfo:' + resp);
                        });
                });
            }
        };
    }
]);
