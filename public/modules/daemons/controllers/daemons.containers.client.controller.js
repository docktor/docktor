'use strict';

angular.module('daemons').controller('DaemonsContainersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker', 'Containers',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker, Containers) {

        $scope.viewRawJson = false;

        $scope.findOne = function () {
            $scope.daemon = Daemons.get({
                daemonId: $stateParams.daemonId
            });

            DaemonsDocker.machineInfo($stateParams.daemonId).
                success(function (machineInfo) {
                    $scope.machineInfo = machineInfo;
                })
                .error(function (resp) {
                    console.log('Error with DaemonsDocker.machineInfo:' + resp);
                });

            DaemonsDocker.listContainers($stateParams.daemonId).
                success(function (containers) {
                    $scope.containers = containers;
                    $scope.containers.forEach(function (container) {
                        $scope.inspect(container);
                    });
                })
                .error(function (resp) {
                    console.log('Error with DaemonsDocker.info:' + resp);
                });
        };

        $scope.inspect = function (container) {
            Containers.inspectContainer($scope.daemon._id, container.Id).
                success(function (data, status, headers, config) {
                    container.inspect = data;
                    $scope.stats(container);
                }).
                error(function (data, status, headers, config) {
                    console.log('Error:');
                    console.log(data);
                });
        };

        $scope.stats = function(container) {
            if (container.inspect.State.Running === true) {
                Containers.statsContainer($scope.daemon._id, container.Id).
                    success(function (containerInfo, status, headers, config) {
                        container.stats = containerInfo.stats;

                        var cur = containerInfo.stats[containerInfo.stats.length - 1];
                        var cpuUsage = 0;
                        if (containerInfo.spec.has_cpu && containerInfo.stats.length >= 2) {
                            var prev = containerInfo.stats[containerInfo.stats.length - 2];
                            var rawUsage = cur.cpu.usage.total - prev.cpu.usage.total;
                            var intervalInNs = DaemonsDocker.getInterval(cur.timestamp, prev.timestamp);
                            // Convert to millicores and take the percentage
                            cpuUsage = Math.round(((rawUsage / intervalInNs) / $scope.machineInfo.num_cores) * 100);
                            if (cpuUsage > 100) {
                                cpuUsage = 100;
                            }
                        }
                        container.stats.cpuUsagePercent = cpuUsage;

                        if (containerInfo.spec.has_memory) {
                            // Saturate to the machine size.
                            var limit = containerInfo.spec.memory.limit;
                            if (limit > $scope.machineInfo.memory_capacity) {
                                limit = $scope.machineInfo.memory_capacity;
                            }
                            container.stats.memoryLimit = limit;
                            container.stats.memoryUsage = Math.round(cur.memory.usage / 1000000);
                            container.stats.memoryUsagePercent = Math.round((cur.memory.usage / limit) * 100);
                        }
                    }).
                    error(function (data, status, headers, config) {
                        console.log('Error:');
                        console.log(data);
                    });
            }
        };

        $scope.callbackError = function (data) {
            console.log('Error:');
            console.log(data);
        };

        $scope.createContainer = function (container) {
            Containers.actionContainer('create', $scope.daemon._id, container, $scope.findOne, $scope.callbackError);
        };

        $scope.startContainer = function (container) {
            Containers.actionContainer('start', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.stopContainer = function (container) {
            Containers.actionContainer('stop', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.pauseContainer = function (container) {
            Containers.actionContainer('pause', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.unpauseContainer = function (container) {
            Containers.actionContainer('unpause', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.removeContainer = function (container) {
            Containers.actionContainer('remove', $scope.daemon._id, container, $scope.findOne, $scope.callbackError);
        };

        $scope.killContainer = function (container) {
            Containers.actionContainer('kill', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };
    }
]);