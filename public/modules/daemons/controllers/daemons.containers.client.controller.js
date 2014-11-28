'use strict';

angular.module('daemons').controller('DaemonsContainersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker', 'Containers',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker, Containers) {

        $scope.viewRawJson = false;
        $scope.infos = [];
        $scope.alerts = [];

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

        $scope.callbackError = function (container, err, index) {
            var msg = [];
            msg.push(err.message);
            var title = 'Error - ' + moment().format('hh:mm:ss');
            $scope.alerts.push({title: title, type: 'danger', msg: msg});
            $scope.closeInfo(index);
        };

        $scope.callbackSuccess = function (container, data, index, cbSuccessEnd) {
            $scope.closeInfo(index);
            cbSuccessEnd(container, data);
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.closeInfo = function (index) {
            $scope.infos.splice(index, 1);
        };

        $scope.addInfo = function (msg) {
            var index = $scope.infos.length;
            msg = moment().format('hh:mm:ss') + ' ' + msg;
            $scope.infos.push({msg: msg});
            return index;
        };

        $scope.createContainer = function (container) {
            var index = $scope.addInfo('Create ' + container.inspect.Name);
            Containers.actionContainer('create', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.findOne, $scope.callbackError);
        };

        $scope.startContainer = function (container) {
            var index = $scope.addInfo('Starting ' + container.inspect.Name);
            Containers.actionContainer('start', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.stopContainer = function (container) {
            var index = $scope.addInfo('Stopping ' + container.inspect.Name);
            Containers.actionContainer('stop', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.pauseContainer = function (container) {
            var index = $scope.addInfo('Pausing ' + container.inspect.Name);
            Containers.actionContainer('pause', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.unpauseContainer = function (container) {
            var index = $scope.addInfo('Unpausing ' + container.inspect.Name);
            Containers.actionContainer('unpause', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.removeContainer = function (container) {
            var index = $scope.addInfo('Removing ' + container.inspect.Name);
            Containers.actionContainer('remove', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.findOne, $scope.callbackError);
        };

        $scope.killContainer = function (container) {
            var index = $scope.addInfo('Killing ' + container.inspect.Name);
            Containers.actionContainer('kill', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.topContainer = function (container) {
            Containers.actionContainer('top', $scope.daemon._id, container, function (container, data) {
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
            Containers.actionContainer('logs', $scope.daemon._id, container, function (container, data) {
                var title = 'Logs in container ' + container.name;
                var msg = [];
                for (var value in data) {
                    var s = '' + data[value];
                    // display only line with date 2014-...
                    if (s.length > 2 && s.substring(0, 2) === '20') {
                        msg.push(s);
                    }
                }
                $scope.alerts.push({title: title, type: 'success', msg: msg});
            }, $scope.callbackError);
        };

    }
]);
