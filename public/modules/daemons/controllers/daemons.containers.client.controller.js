'use strict';

angular.module('daemons').controller('DaemonsContainersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker) {

        $scope.findOne = function () {
            $scope.daemon = Daemons.get({
                daemonId: $stateParams.daemonId
            });

            DaemonsDocker.listContainers($stateParams.daemonId).
                success(function (containers) {
                    $scope.containers = containers;
                })
                .error(function (resp) {
                    console.log('Error with DaemonsDocker.info:' + resp);
                });
        };
    }
]);