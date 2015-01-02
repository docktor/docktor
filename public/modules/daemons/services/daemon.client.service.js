'use strict';

angular.module('daemons').factory('Daemon', ['DaemonsDocker', 'Toasts',
    function (DaemonsDocker, Toasts) {
        return {
            getcAdvisorUrl: function (daemon) {
                return daemon.cadvisorApi.substring(0, daemon.cadvisorApi.indexOf('/api'));
            },
            getDetails: function (daemon, callback) {
                daemon.dockerStatus = 'checking';

                DaemonsDocker.infos(daemon._id).
                    success(function (infos) {
                        daemon.dockerInfo = infos.info;
                        if (infos.info) {
                            daemon.dockerStatus = 'up';
                            daemon.dockerStatusUp = true;
                        } else {
                            daemon.dockerStatus = 'down';
                        }

                        daemon.dockerVersion = infos.version;
                        daemon.machineInfo = infos.machineInfo;

                        daemon.statsCompute = {};

                        if (daemon.machineInfo) {
                            DaemonsDocker.statsDaemon(daemon._id).
                                success(function (daemonInfo, status, headers, config) {
                                    if (daemonInfo && daemonInfo.stats) {
                                        var cur = daemonInfo.stats[daemonInfo.stats.length - 1];
                                        daemon.statsCompute = cur;

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
                                    Toasts.addToast(data, 'danger', 'Error retrieving info on cAdvisor for daemon ' + daemon.name);
                                    if (callback) callback();
                                });
                        } else {
                            console.log('noMachineInfo for daemon ' + daemon._id);
                            Toasts.addToast('noMachineInfo found', 'danger', 'Error with daemon' + daemon.name);
                            if (callback) callback();
                        }
                    })
                    .error(function (data, status, headers, config) {
                        daemon.dockerStatus = 'down';
                        console.log('Error with Daemon.getInfoOnly on :' + daemon._id + ':');
                        console.log(data);
                        Toasts.addToast(data, 'danger', 'Error getting info with daemon' + daemon.name);
                        if (callback) callback();
                    });
            }
        };
    }
]);
