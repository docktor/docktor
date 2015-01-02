'use strict';

angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'GroupsServices', 'Daemon', 'Containers', 'DaemonsDocker', 'Daemons', 'ServicesServices', 'Toasts', '$mdDialog',
    function ($scope, $stateParams, $location, Authentication, Groups, GroupsServices, Daemon, Containers, DaemonsDocker, Daemons, ServicesServices, Toasts, $mdDialog) {
        $scope.authentication = Authentication;

        $scope.patternTitle = /^[a-zA-Z0-9_]{1,200}$/;

        //TODO Grafana URL -> Admin Parameter
        // See https://github.com/docktor/docktor/issues/64
        $scope.grafanaUrl = 'http://' + $location.host() + ':8090/#/dashboard/script/docktor.js';

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
                }, function (errorResponse) {
                    var title = 'Error - ' + moment().format('hh:mm:ss');
                    var err = [];
                    if (errorResponse.data.message) {
                        err.push(errorResponse.data.message);
                    } else {
                        err.push(errorResponse);
                    }
                    Toasts.addToast(err, 'danger', title);
                });
            }
        };

        $scope.update = function () {
            var group = $scope.group;
            group.daemon = $scope.group.selectDaemon._id;
            // fix entity too large. Remove temporary var.
            group.selectDaemon = null;
            // todo : do not post containers var in update group
            angular.forEach(group.containers, function (container, key) {
                container.inspect = null;
                container.daemon = null;
                container.statsCompute = null;
            });
            group.$update(function () {
                $location.path('groups/' + group._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function () {
            $scope.groups = Groups.query();
        };

        $scope.findForCreateOrEditGroup = function () {
            $scope.daemons = {};
            $scope.daemons.all = [];
            $scope.daemons.ids = [];

            if ($stateParams.groupId) {
                Groups.get({
                    groupId: $stateParams.groupId
                }, function (group) {
                    $scope.group = group;
                    $scope.getAllDaemons();
                });
            } else {
                $scope.group = new Groups();
                $scope.getAllDaemons();
            }
        };

        $scope.getAllDaemons = function () {
            Daemons.query(function (daemons) {
                daemons.forEach(function (daemon) {
                    daemon.cadvisorUrl = Daemon.getcAdvisorUrl(daemon);
                    $scope.daemons.all.push(daemon);
                    if ($scope.group.daemon && daemon._id === $scope.group.daemon._id) {
                        $scope.group.selectDaemon = daemon;
                    }
                });
            });
        };

        $scope.findOne = function () {
            $scope.daemons = {};
            $scope.daemons.all = [];
            $scope.daemons.ids = [];

            Groups.get({
                groupId: $stateParams.groupId,
                containerId: $stateParams.containerId
            }, function (group) {
                $scope.group = group;
                var allDaemonsContainer = {};

                $scope.group.containers.forEach(function (container) {
                    if (!$stateParams.containerId ||
                        ($stateParams.containerId && container._id === $stateParams.containerId)) {
                        allDaemonsContainer[container.daemonId] = true;
                    }
                });

                $scope.prepareDaemonsAll(allDaemonsContainer, function (daemon) {
                    $scope.group.containers.forEach(function (container) {
                        if (container.daemonId == daemon._id) {
                            container.daemon = $scope.getDaemon(container.daemonId);

                            if ($stateParams.containerId && container._id === $stateParams.containerId) {
                                $scope.container = container;
                            }

                            if ((container.serviceId) && (!$stateParams.containerId ||
                                ($stateParams.containerId && container._id === $stateParams.containerId))) {
                                ServicesServices.getUrlsAndCommands(container.serviceId, $scope.group._id)
                                    .success(function (data) {
                                        container.commands = data.commands;
                                        container.urls = [];
                                        angular.forEach(data.urls, function (url, key) {
                                            var urlO = $scope.computeUrl(container, url);
                                            container.urls.push(urlO);
                                        });
                                    });
                            }
                            $scope.inspect(container);
                        }
                    });
                });
                GroupsServices.getUsersOnGroup($scope.group._id)
                    .success(function (users) {
                        $scope.group.users = users;
                        var mailAll = '';
                        users.forEach(function (user) {
                            mailAll += user.email + ';';
                        });
                        $scope.group.mailAllUsers = mailAll;
                    });
            });
        };

        $scope.computeFsForGroup = function () {
            angular.forEach($scope.group.filesystems, function (fs, key) {
                var found = _.where($scope.getDaemon(fs.daemon).statsCompute.filesystem, {'device': fs.partition});
                if (found) fs.statsCompute = found[0];
            });
        };

        $scope.prepareDaemonsAll = function (allDaemonsContainer, cb) {
            if (allDaemonsContainer && !_.isEmpty(allDaemonsContainer)) {
                angular.forEach(allDaemonsContainer, function (value, daemonId) {
                    if (!_.contains($scope.daemons.ids, daemonId)) {
                        $scope.daemons.ids.push(daemonId);
                        Daemons.get({
                            daemonId: daemonId
                        }, function (daemon) {
                            daemon.cadvisorUrl = Daemon.getcAdvisorUrl(daemon);
                            $scope.daemons.all.push(daemon);
                            if ($scope.group.daemon && daemon._id === $scope.group.daemon._id) {
                                $scope.group.selectDaemon = daemon;
                            }
                            Daemon.getDetails(daemon, function () {
                                $scope.computeFsForGroup();
                            });

                            if (cb) cb(daemon);
                        });
                    }
                });
            }
        };

        $scope.inspect = function (container, dataSuccess) {
            if (!container.containerId && dataSuccess && dataSuccess.id) {
                container.containerId = dataSuccess.id;
            }
            if (container.containerId) {
                GroupsServices.inspect($scope.group._id, container._id).
                    success(function (data, status, headers, config) {
                        container.inspect = data;
                    }).
                    error(function (err, status, headers, config) {
                        $scope.callbackError(container, err);
                    });
            }
        };

        $scope.callbackError = function (container, err, index) {
            var msg = [];
            msg.push(err.message);
            var title = 'Error - ' + moment().format('hh:mm:ss');
            Toasts.closeToast(index);
            Toasts.addToast(msg, 'danger', title);
        };

        $scope.callbackSuccessRemove = function (container, data, index, cbSuccessEnd) {
            container.containerId = null;
            $scope.callbackSuccess(container, data, index, cbSuccessEnd);
        };

        $scope.callbackSuccess = function (container, data, index, cbSuccessEnd) {
            Toasts.closeToast(index);
            cbSuccessEnd(container, data);
        };

        $scope.gotoList = function () {
            $location.path('groups/' + $scope.group._id);
        };

        $scope.removeServiceFromGroup = function (container) {
            var index = Toasts.addToast('Removing service ' + container.serviceTitle + ' from group');
            GroupsServices.action('removeServiceFromGroup', $scope.group._id, container, $scope.callbackSuccess, index, $scope.gotoList, $scope.callbackError);
        };

        $scope.createContainer = function (container) {
            var index = Toasts.addToast('Create service ' + container.serviceTitle);
            GroupsServices.action('create', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.startContainer = function (container) {
            var index = Toasts.addToast('Starting service ' + container.serviceTitle);
            GroupsServices.action('start', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.stopContainer = function (container) {
            var index = Toasts.addToast('Stopping service ' + container.serviceTitle);
            GroupsServices.action('stop', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.pauseContainer = function (container) {
            var index = Toasts.addToast('Pausing service ' + container.serviceTitle);
            GroupsServices.action('pause', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.unpauseContainer = function (container) {
            var index = Toasts.addToast('Unpausing service ' + container.serviceTitle);
            GroupsServices.action('unpause', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.removeContainer = function (container) {
            var index = Toasts.addToast('Removing service ' + container.serviceTitle);
            GroupsServices.action('remove', $scope.group._id, container, $scope.callbackSuccessRemove, index, $scope.inspect, $scope.callbackError);
        };

        $scope.killContainer = function (container) {
            var index = Toasts.addToast('Killing service ' + container.serviceTitle);
            GroupsServices.action('kill', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.topContainer = function (container) {
            GroupsServices.action('top', $scope.group._id, container, function (container, data) {
                var title = 'top on container ' + container.name;
                var msg = [];
                msg.push(data.Titles);
                angular.forEach(data.Processes, function (value, key) {
                    msg.push(value);
                });

                $mdDialog.show(
                    $mdDialog.alert()
                        .title(title)
                        .content(msg)
                        .ok('Close'));
            }, $scope.callbackError);
        };

        $scope.logsContainer = function (container) {
            GroupsServices.action('logs', $scope.group._id, container, function (container, data) {
                var title = 'Logs in container ' + container.name;
                var msg = [];
                for (var value in data) {
                    var s = '' + data[value];
                    // display only line with date 2014-...
                    if (s.length > 2 && s.substring(0, 2) === '20') {
                        msg.push(s);
                    }
                }
                //Toasts.addToast(msg, 'success', title);
                $mdDialog.show(
                    $mdDialog.alert()
                        .title(title)
                        .content(msg)
                        .ok('Close'));

            }, $scope.callbackError);
        };

        $scope.doExec = function (container, command) {
            var index = Toasts.addToast('command ' + command.exec + ' on container ' + container.name);
            GroupsServices.exec($scope.group._id, container._id, container.serviceId, command._id)
                .success(function (data, status, headers, config) {
                    var title = 'Execution of command ' + command.exec + ' on container ' + container.name;
                    Toasts.addToast(data, 'success', title);
                    Toasts.closeToast(index);
                })
                .error(function (err, status, headers, config) {
                    Toasts.closeToast(index);
                    $scope.callbackError(container, err);
                });
        };

        $scope.showFreePortRangeOnContainer = function () {
            GroupsServices.getFreePortRangeOnContainer($scope.group.selectDaemon._id)
                .success(function (data, status, headers, config) {
                    $scope.freePortRange = data;
                });
        };

        $scope.getDaemon = function (idDaemon) {
            return _.where($scope.daemons.all, {'_id': idDaemon})[0];
        };

        $scope.removeFilesystem = function (filesystem) {
            $scope.group.filesystems.splice($scope.group.filesystems.indexOf(filesystem), 1);
        };

        $scope.changeDaemonFilesystem = function () {
            $scope.filesystem.currentFs = null;
            Daemon.getDetails($scope.filesystem.selectDaemon, function () {
            });
        };

        $scope.addFilesystem = function () {
            if (!$scope.group.filesystems) $scope.group.filesystems = [];
            $scope.filesystem.currentFs = null;
            $scope.filesystem.daemon = $scope.filesystem.selectDaemon._id;
            $scope.filesystem.selectDaemon = null;
            $scope.group.filesystems.push($scope.filesystem);
            $scope.filesystem = {};
        };


        $scope.changeFilesystem = function () {
            if (!$scope.filesystem) $scope.filesystem = {};
            $scope.filesystem.partition = $scope.filesystem.currentFs.device;
        };

        $scope.computeUrl = function (container, url) {
            if (url.url.substr(0, 1) === ':') {
                var urlWithoutPort = '';
                var portInContainer = url.url.substr(1, url.url.length);
                var pos = url.url.indexOf('/');
                if (pos > 0) {
                    portInContainer = url.url.substr(1, pos);
                    urlWithoutPort = url.url.substr(pos, url.url.length);
                    if (!urlWithoutPort) urlWithoutPort = '';
                }
                var portMapping = _.where(container.ports, {'internal': parseInt(portInContainer)});
                var portExternal = '';
                if (portMapping && portMapping.length > 0) portExternal = ':' + portMapping[0].external;

                if (!container.daemon) {
                    url.urlCompute = '';
                } else {
                    url.urlCompute = 'http://' + container.daemon.host + portExternal + urlWithoutPort;
                }

            } else {
                url.urlCompute = 'http://' + container.daemon.host + url.url;
            }
            return url;
        };
    }
]);
