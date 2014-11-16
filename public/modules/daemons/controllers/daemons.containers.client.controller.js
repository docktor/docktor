'use strict';

angular.module('daemons').controller('DaemonsContainersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker', 'Containers',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker, Containers) {

        $scope.viewRawJson = false;

        $scope.findOne = function () {
            Daemons.get({
                daemonId: $stateParams.daemonId
            }, function (daemon) {
                $scope.daemon = daemon;
                DaemonsDocker.machineInfo($scope.daemon._id).
                    success(function (machineInfo) {
                        $scope.machineInfo = machineInfo;
                    })
                    .error(function (resp) {
                        console.log('Error with DaemonsDocker.machineInfo:' + resp);
                    });

                DaemonsDocker.listContainers($scope.daemon._id).
                    success(function (containers) {
                        $scope.containers = containers;
                        $scope.containers.forEach(function (container) {
                            $scope.inspect(container);
                        });
                    })
                    .error(function (resp) {
                        console.log('Error with DaemonsDocker.info:' + resp);
                    });
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

        $scope.stats = function (container) {
            if (container.inspect.State.Running === true) {
                Containers.statsContainer(container, $scope.machineInfo, $scope.daemon._id, container.Id, $scope.callbackError);
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
