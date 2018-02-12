'use strict';

angular.module('groups').controller('ServicesGroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'Services', 'Daemons', 'GroupsServices',
    function ($scope, $stateParams, $location, Authentication, Groups, Services, Daemons, GroupsServices) {
        $scope.authentication = Authentication;

        $scope.patternName = /^[a-zA-Z0-9_\-/]{1,200}$/;
        $scope.patternHostname = /^[a-zA-Z0-9_\-]{1,200}$/;
        $scope.patternNetworkName = /^[a-zA-Z0-9_\-]{1,200}$/;
        $scope.daemonSearchText = '';
        $scope.serviceSearchText = '';

        $scope.container = {};

        $scope.getDaemonsFromText = function (daemons, daemonSearchText) {
            return $scope.getObjFromText(daemons, daemonSearchText, function (o) {
                return o.name;
            });
        };

        $scope.getServicesFromText = function (services, serviceSearchText) {
            return $scope.getObjFromText(services, serviceSearchText, function (o) {
                return o.title;
            });
        };

        $scope.getObjFromText = function (array, text, getPropertyFunc) {
            var a = array || [];
            if (text) {
                return _.filter(a, function (o) {
                    return getPropertyFunc(o).toLowerCase().indexOf(text.toLowerCase()) !== -1;
                });
            }

            return a;
        };

        $scope.findOne = function () {
            Groups.get({
                groupId: $stateParams.groupId
            }, function (group) {
                $scope.group = group;
                $scope.services = {};
                $scope.services.all = Services.query();

                $scope.daemons = {};
                Daemons.query(function (daemons) {
                    $scope.daemons.all = daemons;
                    daemons.forEach(function (daemon) {
                        if (daemon._id === $scope.group.daemon._id) {
                            $scope.daemons.select = daemon;
                            $scope.daemonSearchText = daemon.name;
                        }
                    });
                });
            });
        };

        $scope.changeDaemon = function () {
            $scope.services.select = null;
            $scope.services.selectImage = null;
            $scope.serviceSearchText = '';
        };

        $scope.changeService = function () {
            $scope.services.selectImage = null;
        };

        $scope.changeImage = function () {
            if ($scope.services.selectImage) {
                // Hostname
                var parameter = {};
                $scope.container.hostname = $scope.group.title + '-' + $scope.services.select.title + '-' + $scope.daemons.select.name;

                // add default grom Deamon
                $scope.services.selectImage.parameters = _.union($scope.services.selectImage.parameters, $scope.daemons.select.parameters);
                $scope.services.selectImage.ports = _.union($scope.services.selectImage.ports, $scope.daemons.select.ports);
                $scope.services.selectImage.variables = _.union($scope.services.selectImage.variables, $scope.daemons.select.variables);
                $scope.services.selectImage.volumes = _.union($scope.services.selectImage.volumes, $scope.daemons.select.volumes);
                $scope.services.selectImage.labels = [];

                $scope.services.selectImage.volumes.forEach(function (volume) {
                    var internal = volume.value;
                    if (!volume.value) {
                        internal = $scope.daemons.select.volume + '/' + $scope.group.title + '/' + $scope.services.select.title + volume.internal;
                    }
                    if (!volume.rights) {
                        volume.rights = 'rw';
                    }
                    volume.external = internal;
                });

                $scope.container.name = '/' + $scope.group.title + '-' + $scope.services.select.title;
                $scope.containerNameAlreadyUsed = false;
                if ($scope.group.containers && $scope.container.name && _.filter($scope.group.containers, function (c) { return c.name === $scope.container.name; }).length !== 0) {
                    $scope.containerNameAlreadyUsed = true;
                }

                GroupsServices.getFreePorts($scope.group._id)
                    .success(function (freePorts) {
                        $scope.freePorts = freePorts;
                        var freeP = 0;
                        $scope.services.selectImage.ports.forEach(function (port, i) {
                            if ($scope.group && $scope.group.isSSO) {
                                // When using SSO, by default, only expose the container to the local host
                                port.host = '127.0.0.1';
                                // When using SSO, we add a label for each internal port in order to generate distinct URL
                                var labelValue = i + 1;
                                $scope.services.selectImage.labels.push(
                                    { name: '' + port.internal, value: 'ui' + labelValue }
                                );
                            }
                            port.external = freePorts[freeP];
                            freeP++;
                        });
                    });

                if ($scope.group && $scope.group.isSSO) {
                    $scope.services.selectImage.variables.push(
                        {
                            'name': 'ENABLE_SSO',
                            'value': 'true'
                        }
                    );

                    $scope.services.selectImage.labels.push(
                        { name: 'PROJECT_NAME', value: $scope.group.title },
                        { name: 'SERVICE_TYPE', value: $scope.services.select.title }
                    );
                }
            }
        };

        $scope.addImageToGroup = function (daemon, image) {
            var group = $scope.group;

            var parameters = [];
            image.parameters.forEach(function (parameter) {
                if (!_.isEmpty(parameter.name) && !_.isEmpty(parameter.value)) {
                    parameters.push(parameter);
                }
            });

            var variables = [];
            image.variables.forEach(function (variable) {
                if (_.isString(variable.name) && _.isString(variable.value) && !_.isEmpty(variable.name) && !_.isEmpty(variable.value)) {
                    variables.push(variable);
                }
            });

            var volumes = [];
            image.volumes.forEach(function (volume) {
                if (_.isString(volume.internal) && _.isString(volume.external) && !_.isEmpty(volume.internal) && !_.isEmpty(volume.external)) {
                    volumes.push(volume);
                }
            });

            var ports = [];
            image.ports.forEach(function (port) {
                //if (_.isNumber(port.internal) && _.isNumber(port.external)) {
                ports.push(port);
                //}
            });

            var labels = [];
            image.labels.forEach(function (label) {
                labels.push(label);
            });

            group.containers.push({
                name: $scope.container.name,
                hostname: $scope.container.hostname,
                networkName: $scope.container.networkName,
                image: image.name,
                serviceTitle: $scope.services.select.title,
                serviceId: $scope.services.select._id,
                parameters: parameters,
                variables: variables,
                ports: ports,
                volumes: volumes,
                labels: labels,
                daemonId: daemon._id,
                active: true
            });

            group.$update(function (groupSaved) {
                var newContainer = _.where(groupSaved.containers, {
                    'name': $scope.container.name,
                    'daemonId': daemon._id
                })[0];
                $location.path('groups/' + group._id + '/' + newContainer._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);
