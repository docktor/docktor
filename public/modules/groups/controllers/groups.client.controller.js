'use strict';

angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'GroupsServices', 'Daemon', 'Containers', 'DaemonsDocker', 'Daemons', 'ServicesServices',
    function ($scope, $stateParams, $location, Authentication, Groups, GroupsServices, Daemon, Containers, DaemonsDocker, Daemons, ServicesServices) {
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
            $scope.group.daemon = $scope.group.selectDaemon._id;
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
            group.daemon = $scope.group.selectDaemon._id;
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
                        if (!$stateParams.containerId ||
                            ($stateParams.containerId && container._id === $stateParams.containerId)) {
                            $scope.inspect(container);
                            daemons[container.daemonId] = {};
                        }
                        if ($stateParams.containerId && container._id === $stateParams.containerId) {
                            $scope.container = container;
                        }
                    });
                    angular.forEach(daemons, function (daemon, daemonId) {
                        Daemon.getInfo(daemonId, daemon);
                    });
                    $scope.group.containers.forEach(function (container) {
                        if (!$stateParams.containerId ||
                            ($stateParams.containerId && container._id === $stateParams.containerId)) {
                            $scope.inspect(container);
                            container.daemon = daemons[container.daemonId];
                            if (container.serviceId) {
                                ServicesServices.getCommands(container.serviceId)
                                    .success(function (commands) {
                                        container.commands = commands;
                                    });
                            }
                        }
                    });

                    $scope.daemons = {};
                    Daemons.query(function (daemons) {
                        $scope.daemons.all = daemons;
                        daemons.forEach(function (daemon) {
                            if (daemon._id === $scope.group.daemon._id) {
                                $scope.group.selectDaemon = daemon;
                            }
                        });
                    });
                });
            } else {
                $scope.group = new Groups();
                $scope.daemons = {};
                Daemons.query(function (daemons) {
                    $scope.daemons.all = daemons;
                });
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
            var msg = [];
            msg.push(err.message);
            $scope.alerts.push({title: 'Error', type: 'danger', msg: msg});
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

        $scope.topContainer = function (container) {
            GroupsServices.action('top', $scope.group._id, container, function (container, data) {
                var title = 'top on container ' + container.name;
                var msg = [];
                msg.push(data.Titles);
                angular.forEach(data.Processes, function (value, key) {
                    msg.push(value);
                });

                $scope.alerts.push({title: title, type: 'success', msg: msg});
            }, $scope.callbackError);
        };

        $scope.logsContainer = function (container) {
            GroupsServices.action('logs', $scope.group._id, container, function (container, data) {
                var title = 'Logs in container ' + container.name;
                var msg = [];
                console.log(data);
                for (var value in data) {
                    var s = new String(data[value]);
                    // display only line with date 2014-...
                    if (s.length > 2 && s.substring(0, 2) === '20') {
                        msg.push(s);
                    }
                }
                $scope.alerts.push({title: title, type: 'success', msg: msg});
            }, $scope.callbackError);
        };

        $scope.doExec = function (container, command) {
            GroupsServices.exec($scope.group._id, container._id, container.serviceId, command._id)
                .success(function (data, status, headers, config) {
                    var title = 'Execution of command ' + command.exec + ' on container ' + container.name;
                    $scope.alerts.push({title: title, type: 'success', msg: data});
                })
                .error(function (err, status, headers, config) {
                    $scope.callbackError(container, err);
                });
        };
    }
]);
