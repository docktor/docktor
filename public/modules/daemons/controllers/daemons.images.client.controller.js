'use strict';

angular.module('daemons').controller('DaemonsImagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker', 'Images',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker, Images) {

        $scope.viewRawJson = false;
        $scope.infos = [];
        $scope.alerts = [];

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

        $scope.removeImage = function (image) {
            var index = $scope.addInfo('Removing ' + image.Id);
            Images.removeImage($scope.daemon._id, image, $scope.callbackSuccess, index, $scope.findOne, $scope.callbackError);
        };

        $scope.runPullImage = function () {
            $scope.pullImage.pulled = true;
            var info = {'status': 'Running docker pull ' + $scope.pullImage.name + '. Please wait...'};
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
