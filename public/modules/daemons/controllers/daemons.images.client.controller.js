'use strict';

angular.module('daemons').controller('DaemonsImagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker', 'Images',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker, Images) {

        $scope.viewRawJson = false;

        $scope.findOne = function () {
            $scope.daemon = Daemons.get({
                daemonId: $stateParams.daemonId
            });

            DaemonsDocker.listImages($stateParams.daemonId).
                success(function (images) {
                    $scope.images = images;
                    $scope.images.forEach(function (image) {
                        $scope.inspect(image);
                    });
                })
                .error(function (resp) {
                    console.log('Error with DaemonsDocker.info:' + resp);
                });
        };

        $scope.inspect = function (image) {
            Images.inspectImage($scope.daemon._id, image.Id).
                success(function (data, status, headers, config) {
                    image.inspect = data;
                }).
                error(function (data, status, headers, config) {
                    console.log('Error:');
                    console.log(data);
                });
        };

        $scope.removeImage = function (image) {
            Images.removeImage($scope.daemon._id, image, $scope.findOne, $scope.callbackError);
        };

    }
]);