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

        $scope.callbackError = function (data) {
            console.log('Error:');
            console.log(data);
        };

        $scope.removeImage = function (image) {
            Images.removeImage($scope.daemon._id, image, $scope.findOne, $scope.callbackError);
        };

        $scope.runPullImage = function () {
            $scope.pullImage.pulled = true;
            var info = {'status': 'Running docker pull ' + $scope.pullImage.name + '...'};
            $scope.pullImage.output = [info];
            Images.pullImage($scope.daemon._id, $scope.pullImage.name).
                success(function (data) {
                    $scope.findOne();
                    $scope.pullImage.typeAlert = 'success';
                    $scope.pullImage.output = data;
                })
                .error(function (resp) {
                    $scope.pullImage.typeAlert = 'danger';
                    $scope.pullImage.output = 'Internal Error';
                    console.log(resp);
                });
        };

        $scope.initPullImage = function () {
            $scope.pullImage = {
                name: '',
                askToPull: false,
                output: '',
                typeAlert: 'info',
                pulled: false
            };
        };

        $scope.initPullImage();

    }
]);
