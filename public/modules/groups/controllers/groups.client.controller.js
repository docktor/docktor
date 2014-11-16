'use strict';

angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'GroupsServices', 'Daemon', 'Containers', 'DaemonsDocker',
    function ($scope, $stateParams, $location, Authentication, Groups, GroupsServices, Daemon, Containers, DaemonsDocker) {
        $scope.authentication = Authentication;
        $scope.alerts = [];

        $scope.submitForm = function () {
            if ($scope.group._id) {
                $scope.update();
            } else {
                $scope.create();
            }
        };

        $scope.create = function () {
            $scope.group.$save(function (response) {
                $location.path('groups/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (group) {
            if (group) {
                group.$remove();
                for (var i in $scope.groups) {
                    if ($scope.groups[i] === group) {
                        $scope.groups.splice(i, 1);
                    }
                }
            } else {
                $scope.group.$remove(function () {
                    $location.path('groups');
                });
            }
        };

        $scope.update = function () {
            var group = $scope.group;
            group.$update(function () {
                $location.path('groups/' + group._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function () {
            $scope.groups = Groups.query();
        };

        $scope.findOne = function () {
            if ($stateParams.groupId) {
                Groups.get({
                    groupId: $stateParams.groupId
                }, function (group) {
                    $scope.group = group;
                    var daemons = {};
                    $scope.group.containers.forEach(function (container) {
                        $scope.inspect(container);
                        daemons[container.daemonId] = {};
                    });
                    angular.forEach(daemons, function (daemon, daemonId) {
                        Daemon.getInfo(daemonId, daemon);
                    });
                    $scope.group.containers.forEach(function (container) {
                        $scope.inspect(container);
                        container.daemon = daemons[container.daemonId];
                    });
                });
            } else {
                $scope.group = new Groups();
            }
        };

        $scope.inspect = function (container) {
            if (container.containerId) {
                GroupsServices.inspect($scope.group._id, container._id).
                    success(function (data, status, headers, config) {
                        container.inspect = data;
                        if (container.inspect.State.Running === true) {

                            // TODO make one call per daemon to machineInfo
                            DaemonsDocker.machineInfo(container.daemonId).
                                success(function (machineInfo) {
                                    Containers.statsContainer(container, machineInfo, container.daemonId, container.containerId, $scope.callbackError);
                                })
                                .error(function (err) {
                                    $scope.callbackError(container, err);
                                });
                        }
                    }).
                    error(function (err, status, headers, config) {
                        $scope.callbackError(container, err);
                    });
            }
        };

        $scope.callbackError = function (container, err) {
            $scope.alerts.push({type: 'danger', msg: err.message});
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.removeServiceFromGroup = function (container) {
            GroupsServices.action('removeServiceFromGroup', $scope.group._id, container, $scope.findOne, $scope.callbackError);
        };

        $scope.createContainer = function (container) {
            GroupsServices.action('create', $scope.group._id, container, $scope.findOne, $scope.callbackError);
        };

        $scope.startContainer = function (container) {
            GroupsServices.action('start', $scope.group._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.stopContainer = function (container) {
            GroupsServices.action('stop', $scope.group._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.pauseContainer = function (container) {
            GroupsServices.action('pause', $scope.group._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.unpauseContainer = function (container) {
            GroupsServices.action('unpause', $scope.group._id, container, $scope.inspect, $scope.callbackError);
        };

        $scope.removeContainer = function (container) {
            GroupsServices.action('remove', $scope.group._id, container, $scope.findOne, $scope.callbackError);
        };

        $scope.killContainer = function (container) {
            GroupsServices.action('kill', $scope.group._id, container, $scope.inspect, $scope.callbackError);
        };
    }
]);
