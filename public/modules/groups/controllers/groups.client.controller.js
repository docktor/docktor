'use strict';

angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'GroupsServices', 'Daemon', 'Containers', 'DaemonsDocker', 'Daemons', 'ServicesServices',
    function ($scope, $stateParams, $location, Authentication, Groups, GroupsServices, Daemon, Containers, DaemonsDocker, Daemons, ServicesServices) {
        $scope.authentication = Authentication;
        $scope.infos = [];
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
            $scope.group.selectDaemon = null;
            $scope.group.currentFs = null;
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
            group.selectDaemon = null;
            group.currentFs = null;
            group.$update(function () {
                $location.path('groups/');
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

                    $scope.prepareDaemonsAll(true, function () {
                        $scope.group.containers.forEach(function (container) {
                            if (!$stateParams.containerId ||
                                ($stateParams.containerId && container._id === $stateParams.containerId)) {
                                $scope.inspect(container);
                                container.daemon = $scope.getDaemon(container.daemonId);
                                if (container.serviceId) {
                                    ServicesServices.getCommands(container.serviceId)
                                        .success(function (commands) {
                                            container.commands = commands;
                                        });
                                    ServicesServices.getUrls(container.serviceId)
                                        .success(function (urls) {
                                            container.urls = [];
                                            angular.forEach(urls, function (url, key) {
                                                var urlO = $scope.computeUrl(container, url);
                                                container.urls.push(urlO);
                                            });
                                        });
                                }
                            }
                        });
                    });


                });
            } else {
                $scope.group = new Groups();
                $scope.prepareDaemonsAll(false);
            }
        };

        $scope.computeFsForGroup = function (group) {
            if (group.selectDaemon.statsCompute && group.selectDaemon.statsCompute.filesystem) {
                angular.forEach(group.filesystems, function (fs, key) {
                    var found = _.where(group.selectDaemon.statsCompute.filesystem, {'device': fs.partition});
                    if (found) fs.statsCompute = found[0];
                });
            } else {
                console.log('No fs for daemon ' + group.selectDaemon.name);
            }

        };

        $scope.prepareDaemonsAll = function (fsToCompute, cb) {
            $scope.daemons = {};
            $scope.daemons.all = [];
            Daemons.query(function (daemons) {
                daemons.forEach(function (daemon) {
                    Daemon.getDetails(daemon, function () {
                        daemon.cadvisorUrl = Daemon.getcAdvisorUrl(daemon);
                        $scope.daemons.all.push(daemon);
                        if ($scope.group.daemon && daemon._id === $scope.group.daemon._id) {
                            $scope.group.selectDaemon = daemon;
                            $scope.showFreePortRangeOnContainer();
                            if (fsToCompute) $scope.computeFsForGroup($scope.group);
                            if (cb) cb(); // todo fix perf to not compute all time
                        }
                    });
                });
            });
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

        $scope.gotoList = function () {
            $location.path('groups/' + $scope.group._id);
        };

        $scope.removeServiceFromGroup = function (container) {
            var index = $scope.addInfo('Removing service ' + container.serviceTitle + ' from group');
            GroupsServices.action('removeServiceFromGroup', $scope.group._id, container, $scope.callbackSuccess, index, $scope.gotoList, $scope.callbackError);
        };

        $scope.createContainer = function (container) {
            var index = $scope.addInfo('Create service ' + container.serviceTitle);
            GroupsServices.action('create', $scope.group._id, container, $scope.callbackSuccess, index, $scope.findOne, $scope.callbackError);
        };

        $scope.startContainer = function (container) {
            var index = $scope.addInfo('Starting service ' + container.serviceTitle);
            GroupsServices.action('start', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.stopContainer = function (container) {
            var index = $scope.addInfo('Stopping service ' + container.serviceTitle);
            GroupsServices.action('stop', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.pauseContainer = function (container) {
            var index = $scope.addInfo('Pausing service ' + container.serviceTitle);
            GroupsServices.action('pause', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.unpauseContainer = function (container) {
            var index = $scope.addInfo('Unpausing service ' + container.serviceTitle);
            GroupsServices.action('unpause', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackError);
        };

        $scope.removeContainer = function (container) {
            var index = $scope.addInfo('Removing service ' + container.serviceTitle);
            GroupsServices.action('remove', $scope.group._id, container, $scope.callbackSuccess, index, $scope.findOne, $scope.callbackError);
        };

        $scope.killContainer = function (container) {
            var index = $scope.addInfo('Killing service ' + container.serviceTitle);
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

                $scope.alerts.push({title: title, type: 'success', msg: msg});
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

        $scope.showFreePortRangeOnContainer = function () {
            GroupsServices.getFreePortRangeOnContainer($scope.group.selectDaemon._id)
                .success(function (data, status, headers, config) {
                    $scope.freePortRange = data;
                });
        };

        $scope.getDaemon = function (idDaemon) {
            return _.where($scope.daemons.all, {'_id': idDaemon})[0];
        };

        $scope.addFilesystem = function () {
            if (!$scope.group.filesystems) $scope.group.filesystems = [];
            $scope.group.filesystems.push($scope.filesystem);
            $scope.filesystem = {};
        };

        $scope.removeFilesystem = function (filesystem) {
            $scope.group.filesystems.splice($scope.group.filesystems.indexOf(filesystem), 1);
        };

        $scope.changefs = function () {
            if (!$scope.filesystem) $scope.filesystem = {};
            $scope.filesystem.partition = $scope.group.currentFs.device;
        };

        $scope.computeUrl = function (container, url) {
            if (url.url.substr(0, 1) === ':') {
                var pos = url.url.indexOf('/');
                var urlWithoutPort = '';
                if (pos > 0) {
                    var portInContainer = url.url.substr(1, pos);
                    var urlWithoutPort = url.url.substr(pos, url.url.length);
                    if (!urlWithoutPort) urlWithoutPort = '';
                } else {
                    var portInContainer = url.url.substr(1, url.url.length);
                }

                var portMapping = _.where(container.ports, {'internal': parseInt(portInContainer)});
                var portExternal = '';
                if (portMapping && portMapping.length > 0) portExternal = ':' + portMapping[0].external;

                url.urlCompute = "http://" + container.daemon.host + portExternal + urlWithoutPort;

            } else {
                url.urlCompute = "http://" + container.daemon.host + url.url;
            }
            return url;
        }
    }
]);
