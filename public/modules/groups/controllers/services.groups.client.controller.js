'use strict';

angular.module('groups').controller('ServicesGroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'Services', 'Daemons',
    function ($scope, $stateParams, $location, Authentication, Groups, Services, Daemons) {
        $scope.authentication = Authentication;

        $scope.findOne = function () {
            $scope.group = Groups.get({
                groupId: $stateParams.groupId
            });

            $scope.services = {};
            $scope.services.all = Services.query();

            $scope.daemons = {};
            $scope.daemons.all = Daemons.query();
        };

        $scope.addImageToGroup = function(daemon, image) {
            var group = $scope.group;

            group.containers.push({
                name: image.name,
                ports: image.ports,
                volumes: image.volumes,
                daemon: {
                    protocol: daemon.protocol,
                    host: daemon.host,
                    port: daemon.port
                },
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