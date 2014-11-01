'use strict';

angular.module('daemons').controller('DaemonsContainersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker) {

        $scope.viewRawJson = false;

        $scope.findOne = function () {
            $scope.daemon = Daemons.get({
                daemonId: $stateParams.daemonId
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
            DaemonsDocker.inspect($scope.daemon._id, container.Id).
                success(function (data, status, headers, config) {
                    container.inspect = data;
                }).
                error(function (data, status, headers, config) {
                    console.log('Error:');
                    console.log(data);
                });
        };

        $scope.callbackError = function (data) {
            console.log('Error:');
            console.log(data);
        };

        $scope.createContainer = function (container) {
            DaemonsDocker.actionContainer('create', $scope.daemon._id, container, $scope.findOne, $scope.callbackError);
        };

        $scope.startContainer = function (container) {
            DaemonsDocker.actionContainer('start', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.stopContainer = function (container) {
            DaemonsDocker.actionContainer('stop', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.pauseContainer = function (container) {
            DaemonsDocker.actionContainer('pause', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.unpauseContainer = function (container) {
            DaemonsDocker.actionContainer('unpause', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.removeContainer = function (container) {
            DaemonsDocker.actionContainer('remove', $scope.daemon._id, container, $scope.findOne, $scope.callbackError);
        };

        $scope.killContainer = function (container) {
            DaemonsDocker.actionContainer('kill', $scope.daemon._id, container, $scope.inspect, $scope.callbackError);
        };
    }
]);