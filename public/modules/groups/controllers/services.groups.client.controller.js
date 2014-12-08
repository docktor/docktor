'use strict';

angular.module('groups').controller('ServicesGroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'Services', 'Daemons', 'GroupsServices',
    function ($scope, $stateParams, $location, Authentication, Groups, Services, Daemons, GroupsServices) {
        $scope.authentication = Authentication;

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
                        }
                    });
                });
            });
        };

        $scope.changeImage = function () {
            if ($scope.services.selectImage) {
                // Hostname
                var parameter = {};
                parameter.name = 'Hostname';
                $scope.hostname = $scope.group.title + '-' + $scope.services.select.title + '-' + $scope.daemons.select.name;
                parameter.value = $scope.hostname;
                // default external volume
                $scope.services.selectImage.parameters.push(parameter);

                // add default grom Deamon
                $scope.services.selectImage.parameters = _.union($scope.services.selectImage.parameters, $scope.daemons.select.parameters);
                $scope.services.selectImage.ports = _.union($scope.services.selectImage.ports, $scope.daemons.select.ports);
                $scope.services.selectImage.variables = _.union($scope.services.selectImage.variables, $scope.daemons.select.variables);
                $scope.services.selectImage.volumes = _.union($scope.services.selectImage.volumes, $scope.daemons.select.volumes);

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

                GroupsServices.getFreePorts($scope.group._id)
                    .success(function (freePorts) {
                        $scope.freePorts = freePorts;
                        var freeP = 0;
                        $scope.services.selectImage.ports.forEach(function (port) {
                            port.external = freePorts[freeP];
                            freeP++;
                        });
                    });
            }
        };

        $scope.addImageToGroup = function (daemon, image) {
            var group = $scope.group;
            var containerName = '/' + $scope.group.title + '-' + $scope.services.select.title;

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

            group.containers.push({
                name: containerName,
                hostname: $scope.hostname,
                image: image.name,
                serviceTitle: $scope.services.select.title,
                serviceId: $scope.services.select._id,
                parameters: parameters,
                variables: variables,
                ports: ports,
                volumes: volumes,
                daemonId: daemon._id,
                active: true
            });

            group.$update(function () {
                $location.path('groups/' + group._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);
