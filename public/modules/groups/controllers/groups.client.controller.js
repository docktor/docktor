'use strict';

angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'GroupsServices', 'Daemon', 'Containers', 'DaemonsDocker', 'Daemons', 'ServicesServices', 'Toasts', '$mdDialog', '$timeout', 'UsersService', 'RoleService', 'Menus',
    function ($scope, $stateParams, $location, Authentication, Groups, GroupsServices, Daemon, Containers, DaemonsDocker, Daemons, ServicesServices, Toasts, $mdDialog, $timeout, UsersService, RoleService, Menus) {
        $scope.authentication = Authentication;

        $scope.patternTitle = /^[a-zA-Z0-9_]{1,200}$/;
        $scope.showAddRemoveContact = false;
        $scope.freePortRange = [];

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
                        if (container.daemonId === daemon._id) {
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

                            $scope.prepareJobs(container);
                            $scope.inspect(container);
                        }
                    });
                });
                $scope.getUsersOnGroup();
                $scope.computeGroupFavorite();
            });
        };

        $scope.prepareJobs = function (container) {
            // reverse to keep last execution
            var jobs = _(container.jobs).reverse();
            angular.forEach(jobs, function (job, key) {
                // keep last jobId
                if (!jobs[job.jobId]) {
                    jobs[job.jobId] = {
                        '_id': {
                            'containerId': container._id,
                            'groupId': $scope.group._id,
                            'groupTitle': $scope.group.title,
                            'hostname': container.hostname,
                            'name': container.name,
                            'serviceId': container.serviceId
                        },
                        'status': job.status,
                        'name': job.name,
                        'description': job.description,
                        'result': job.result,
                        'lastExecution': job.lastExecution
                    };
                }
            });

            container.jobsCompute = jobs;
        };

        $scope.getUsersOnGroup = function () {
            GroupsServices.getUsersOnGroup($scope.group._id)
                .success(function (users) {
                    $scope.group.users = users;
                    var mailAll = '';
                    users.forEach(function (user) {
                        mailAll += user.email + ';';
                    });
                    $scope.group.mailAllUsers = mailAll;
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

        $scope.inspectAfterStart = function (container, dataSuccess) {
            var index = Toasts.addToast('waiting 5s after starting ' + container.name + ' to check it', 'info', 'Please wait');
            $timeout(function () {
                Toasts.closeToast(index);
                $scope.inspect(container, dataSuccess);
            }, 5000);
        };

        $scope.callbackError = function (container, err, index) {
            var msg = [];
            msg.push(err.message);
            var title = 'Error - ' + moment().format('hh:mm:ss');
            Toasts.closeToast(index);
            Toasts.addToast(msg, 'danger', title);
        };

        $scope.callbackErrorInspect = function (container, err, index) {
            $scope.callbackError(container, err, index);
            $scope.inspect(container);
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
            GroupsServices.action('removeServiceFromGroup', $scope.group._id, container, $scope.callbackSuccess, index, $scope.gotoList, $scope.callbackErrorInspect);
        };

        $scope.createContainer = function (container) {
            var index = Toasts.addToast('Create service ' + container.serviceTitle);
            GroupsServices.action('create', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackErrorInspect);
        };

        $scope.createContainers = function () {
            var createOne = false;
            $scope.group.containers.forEach(function (container) {
                if (!container.containerId) {
                    $scope.createContainer(container);
                    createOne = true;
                }
            });
            if (!createOne) {
                Toasts.addToast('No service available to create');
            }
        };

        $scope.startContainer = function (container) {
            var index = Toasts.addToast('Starting service ' + container.serviceTitle + '...');
            GroupsServices.action('start', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspectAfterStart, $scope.callbackErrorInspect);
        };

        $scope.startContainers = function () {
            var startOne = false;
            $scope.group.containers.forEach(function (container) {
                if (!container.inspect.State.Running) {
                    $scope.startContainer(container);
                    startOne = true;
                }
            });
            if (!startOne) {
                Toasts.addToast('No service available to start');
            }
        };

        $scope.stopContainer = function (container) {
            var index = Toasts.addToast('Stopping service ' + container.serviceTitle + '...');
            GroupsServices.action('stop', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackErrorInspect);
        };

        $scope.stopContainers = function () {
            var stopOne = false;
            $scope.group.containers.forEach(function (container) {
                if (container.inspect.State.Running && !container.inspect.State.Paused) {
                    $scope.stopContainer(container);
                    stopOne = true;
                }
            });
            if (!stopOne) {
                Toasts.addToast('No service available to stop');
            }
        };

        $scope.pauseContainer = function (container) {
            var index = Toasts.addToast('Pausing service ' + container.serviceTitle + '...');
            GroupsServices.action('pause', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackErrorInspect);
        };

        $scope.pauseContainers = function () {
            var pauseOne = false;
            $scope.group.containers.forEach(function (container) {
                if (container.inspect.State.Running && !container.inspect.State.Paused) {
                    $scope.pauseContainer(container);
                    pauseOne = true;
                }
            });
            if (!pauseOne) {
                Toasts.addToast('No service available to pause');
            }
        };

        $scope.unpauseContainer = function (container) {
            var index = Toasts.addToast('Unpausing service ' + container.serviceTitle + '...');
            GroupsServices.action('unpause', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackErrorInspect);
        };

        $scope.unpauseContainers = function () {
            var unpauseOne = false;
            $scope.group.containers.forEach(function (container) {
                if (container.inspect.State.Running && container.inspect.State.Paused) {
                    $scope.unpauseContainer(container);
                    unpauseOne = true;
                }
            });
            if (!unpauseOne) {
                Toasts.addToast('No service available to unpause');
            }
        };

        $scope.removeContainer = function (container) {
            var index = Toasts.addToast('Removing service ' + container.serviceTitle + '...');
            GroupsServices.action('remove', $scope.group._id, container, $scope.callbackSuccessRemove, index, $scope.inspect, $scope.callbackErrorInspect);
        };

        $scope.removeContainers = function () {
            var removeOne = false;
            $scope.group.containers.forEach(function (container) {
                if (!container.inspect.State.Running) {
                    $scope.removeContainer(container);
                    removeOne = true;
                }
            });

            if (!removeOne) {
                Toasts.addToast('No service available to remove');
            }
        };

        $scope.killContainer = function (container) {
            var index = Toasts.addToast('Killing service ' + container.serviceTitle + '...');
            GroupsServices.action('kill', $scope.group._id, container, $scope.callbackSuccess, index, $scope.inspect, $scope.callbackErrorInspect);
        };

        $scope.killContainers = function () {
            var killOne = false;
            $scope.group.containers.forEach(function (container) {
                if (container.inspect.State.Running) {
                    $scope.killContainer(container);
                    killOne = true;
                }
            });
            if (!killOne) {
                Toasts.addToast('No service available to kill');
            }
        };

        $scope.topContainer = function (container) {
            GroupsServices.action('top', $scope.group._id, container, function (container, data) {
                var title = 'top on container ' + container.name;
                var results = [];
                results.push(data.Titles);
                angular.forEach(data.Processes, function (value, key) {
                    results.push(value);
                });

                $mdDialog.show({
                    controller: 'ContainerCmdDialogController',
                    templateUrl: 'modules/daemons/views/container.cmd.dialog.template.html',
                    locals: {title: title, results: results}
                });

            }, $scope.callbackErrorInspect);
        };

        $scope.logsContainer = function (container) {
            GroupsServices.action('logs', $scope.group._id, container, function (container, data) {
                var title = 'Logs in container ' + container.name;
                var results = [];
                for (var value in data) {
                    var s = '' + data[value];
                    // display only line with date 20-...
                    if (s.length > 2 && s.substring(0, 2) === '20') {
                        results.push(s);
                    }
                }
                $mdDialog.show({
                    controller: 'ContainerCmdDialogController',
                    templateUrl: 'modules/daemons/views/container.cmd.dialog.template.html',
                    locals: {title: title, results: results}
                });

            }, $scope.callbackErrorInspect);
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
                    $scope.callbackErrorInspect(container, err, index);
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
            $scope.filesystem.pleaseWait = true;
            Daemon.getDetails($scope.filesystem.selectDaemon, function () {
                $scope.filesystem.pleaseWait = false;
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

        $scope.prepareAddContact = function () {
            $scope.showAddRemoveContact = true;
            UsersService.listUsersSimplified()
                .success(function (users) {
                    // a role=admin can add himself, not for role=user
                    if ($scope.authentication.user.role !== 'admin') {
                        $scope.users = _.reject(users, {'_id': $scope.authentication.user._id});
                    } else {
                        $scope.users = users;
                    }
                    angular.forEach($scope.group.users, function (user, key) {
                        $scope.users = _.reject($scope.users, {'_id': user.id});
                    });

                });
        };

        $scope.addFavorite = function () {
            UsersService.addFavorite($scope.authentication.user._id, $scope.group._id)
                .success(function (response) {
                    UsersService.me().success(function (response) {
                        $scope.authentication.user = response;
                        $scope.authentication.isAdmin = RoleService.validateRoleAdmin(response);
                        $scope.computeGroupFavorite();
                        Menus.refreshFavorites();
                    });
                }).error(function (err, status, headers, config) {
                    var title = 'Error - ' + moment().format('hh:mm:ss');
                    Toasts.addToast(err, 'danger', title);
                });
        };

        $scope.computeGroupFavorite = function () {
            if (_.where($scope.authentication.user.favorites, {'_id': $scope.group._id}).length > 0) {
                $scope.isGroupFavorite = true;
            } else {
                $scope.isGroupFavorite = false;
            }
        };

        $scope.removeFavorite = function () {
            UsersService.removeFavorite($scope.authentication.user._id, $scope.group._id)
                .success(function (response) {
                    UsersService.me().success(function (response) {
                        $scope.authentication.user = response;
                        $scope.authentication.isAdmin = RoleService.validateRoleAdmin(response);
                        $scope.computeGroupFavorite();
                        Menus.refreshFavorites();
                    });
                }).error(function (err, status, headers, config) {
                    var title = 'Error - ' + moment().format('hh:mm:ss');
                    Toasts.addToast(err, 'danger', title);
                });
        };

        $scope.addContact = function () {
            if ($scope.contactToAdd) {
                UsersService.addGroup($scope.contactToAdd._id, $scope.group._id)
                    .success(function () {
                        $scope.getUsersOnGroup();
                        $scope.cancelAddRemoveContact();
                    }).error(function (err, status, headers, config) {
                        var title = 'Error - ' + moment().format('hh:mm:ss');
                        Toasts.addToast(err, 'danger', title);
                    });
            }
        };

        $scope.removeContact = function () {
            if ($scope.contactToRemove) {
                UsersService.removeGroup($scope.contactToRemove.id, $scope.group._id)
                    .success(function () {
                        if ($scope.authentication.user._id === $scope.contactToRemove.id) {
                            UsersService.me().success(function (response) {
                                $scope.authentication.user = response;
                                $scope.authentication.isAdmin = RoleService.validateRoleAdmin(response);
                                $scope.computeGroupFavorite();
                                Menus.refreshFavorites();
                                $location.path('/');
                            });
                        } else {
                            $scope.getUsersOnGroup();
                            $scope.cancelAddRemoveContact();
                        }

                    }).error(function (err, status, headers, config) {
                        var title = 'Error - ' + moment().format('hh:mm:ss');
                        Toasts.addToast(err, 'danger', title);
                    });
            }
        };

        $scope.cancelAddRemoveContact = function () {
            $scope.showAddRemoveContact = false;
            $scope.contactToAdd = null;
            $scope.contactToRemove = null;
        };

        $scope.showJob = function (info, job) {
            $mdDialog.show({
                controller: 'JobDialogController',
                templateUrl: 'modules/jobs/views/job.dialog.template.html',
                locals: {currentJob: job, info: info}
            });
        };

        $scope.getDisplayJob = function (lastExecution) {
            if (moment().diff(moment(lastExecution), 'minutes') > 60) {
                return '!';
            } else {
                return '.';
            }
        };
    }
]);
