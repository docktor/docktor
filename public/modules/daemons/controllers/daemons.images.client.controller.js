'use strict';

angular.module('daemons').controller('DaemonsImagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker) {

        $scope.viewRawJson = false;

        $scope.findOne = function () {
            $scope.daemon = Daemons.get({
                daemonId: $stateParams.daemonId
            });

            DaemonsDocker.listImages($stateParams.daemonId).
                success(function (images) {
                    $scope.images = images;
                })
                .error(function (resp) {
                    console.log('Error with DaemonsDocker.info:' + resp);
                });
        };
    }
]);