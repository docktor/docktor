'use strict';

angular.module('daemons').controller('DaemonsContainersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker', 'Containers', 'Toasts', '$mdDialog',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker, Containers, Toasts, $mdDialog) {

        $scope.viewRawJson = false;

        $scope.findOne = function () {
            Daemons.get({
                daemonId: $stateParams.daemonId
            }, function (daemon) {
                $scope.daemon = daemon;

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
                }).
                error(function (data, status, headers, config) {
                    console.log('Error:');
                    console.log(data);
                });
        };

        $scope.callbackError = function (container, err, index) {
            var msg = [];
            msg.push(err.message);
            var title = 'Error - ' + moment().format('hh:mm:ss');
            Toasts.addToast(msg, 'danger', title);
            Toasts.closeToast(index);
        };

        $scope.callbackSuccess = function (container, data, index, cbSuccessEnd) {
            Toasts.closeToast(index);
            cbSuccessEnd(container, data);
        };

        $scope.createContainer = function (container) {
            var index = Toasts.addToast('Create ' + container.inspect.Name);
            Containers.actionContainer('create', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.findOne, $scope.callbackError);
        };

        $scope.startContainer = function (container) {
            var index = Toasts.addToast('Starting ' + container.inspect.Name);
            Containers.actionContainer('start', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.stopContainer = function (container) {
            var index = Toasts.addToast('Stopping ' + container.inspect.Name);
            Containers.actionContainer('stop', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.pauseContainer = function (container) {
            var index = Toasts.addToast('Pausing ' + container.inspect.Name);
            Containers.actionContainer('pause', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.unpauseContainer = function (container) {
            var index = Toasts.addToast('Unpausing ' + container.inspect.Name);
            Containers.actionContainer('unpause', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.removeContainer = function (container) {
            var index = Toasts.addToast('Removing ' + container.inspect.Name);
            Containers.actionContainer('remove', $scope.daemon._id, container, $scope.callbackSuccess, index, $scope.findOne, $scope.callbackError);
        };

        $scope.killContainer = function (container) {
            var index = Toasts.addToast('Killing ' + container.inspect.Name);
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

                Toasts.addToast(msg, 'success', title);
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
                Toasts.addToast(msg, 'success', title);
            }, $scope.callbackError);
        };

        $scope.showInfo = function (container) {

            $scope.currentContainer = container;
            var content = "Name :" + container.inspect.Name + "<br>";
            $mdDialog.show({
                controller: 'ContainerInfosController',
                templateUrl: 'modules/daemons/views/dialog.template.html',
                locals: {currentContainer: container}
            })
        };
    }
]);

angular.module('daemons').controller('ContainerInfosController', ['$scope', '$mdDialog', 'currentContainer',
    function ($scope, $mdDialog, currentContainer) {
        $scope.currentContainer = currentContainer;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }
]);
