'use strict';

angular.module('daemons').controller('DaemonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker) {
        $scope.authentication = Authentication;

        $scope.create = function () {
            var daemon = new Daemons({
                name: this.name,
                protocol: this.protocol,
                host: this.host,
                port: this.port,
                timedout: this.timedout,
                ca: this.ca,
                cert: this.cert,
                key: this.key,
                volume: this.volume,
                cadvisorApi: this.cadvisorApi,
                description: this.description
            });
            daemon.$save(function (response) {
                $location.path('daemons/view/' + response._id);

                $scope.name = '';
                $scope.protocol = '';
                $scope.host = '';
                $scope.port = '';
                $scope.timedout = 5000;
                $scope.ca = '';
                $scope.cert = '';
                $scope.key = '';
                $scope.volume = '';
                $scope.cadvisorApi = '';
                $scope.description = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (daemon) {
            if (daemon) {
                daemon.$remove();
                for (var i in $scope.daemons) {
                    if ($scope.daemons[i] === daemon) {
                        $scope.daemons.splice(i, 1);
                    }
                }
            } else {
                $scope.daemon.$remove(function () {
                    $location.path('daemons');
                });
            }
        };

        $scope.update = function () {
            var daemon = $scope.daemon;
            daemon.$update(function () {
                $location.path('daemons/view/' + daemon._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function () {
            $scope.daemons = Daemons.query(function () {
                angular.forEach($scope.daemons, function () {
                    var daemon = $scope.daemons[0];

                    daemon.cadvisorUrl = daemon.cadvisorApi.substring(0, daemon.cadvisorApi.indexOf('/api'));
                    daemon.dockerUp = false;

                    DaemonsDocker.info(daemon._id).
                        success(function (info) {
                            daemon.dockerInfo = info;
                            daemon.dockerUp = true;

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
                                        }).
                                        error(function (data, status, headers, config) {
                                            console.log('Error:');
                                            console.log(data);
                                        });

                                })
                                .error(function (resp) {
                                    console.log('Error with DaemonsDocker.machineInfo:' + resp);
                                });
                        })
                        .error(function (resp) {
                            console.log('Error with DaemonsDocker.info on :' + daemon._id + ':' + resp);
                        });

                });
            });
        };

        $scope.findOne = function () {
            $scope.daemon = Daemons.get({
                daemonId: $stateParams.daemonId
            });
            DaemonsDocker.info($stateParams.daemonId).
                success(function (info) {
                    $scope.dockerInfo = info;
                }).
                error(function (data, status, headers, config) {
                    console.log('Error with DaemonsDocker.info:' + resp);
                });
        };
    }
]);
