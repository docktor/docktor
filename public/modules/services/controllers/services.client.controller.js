'use strict';

angular.module('services').controller('ServicesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Services',
    function ($scope, $stateParams, $location, Authentication, Services) {
        $scope.authentication = Authentication;

        $scope.displayFormImage = false;
        $scope.port = {};
        $scope.displayFormPort = false;
        $scope.variable = {};
        $scope.displayFormVariable = false;
        $scope.volume = {};
        $scope.displayFormVolume = false;

        $scope.create = function () {
            var service = new Services({
                title: this.title
            });
            service.$save(function (response) {
                $location.path('services/' + response._id);
                $scope.title = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (service) {
            if (service) {
                service.$remove();

                for (var i in $scope.services) {
                    if ($scope.services[i] === service) {
                        $scope.services.splice(i, 1);
                    }
                }
            } else {
                $scope.service.$remove(function () {
                    $location.path('services');
                });
            }
        };

        $scope.update = function () {
            var service = $scope.service;

            service.$update(function () {
                $location.path('services/' + service._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function () {
            $scope.services = Services.query();
        };

        $scope.findOne = function () {
            $scope.service = Services.get({
                serviceId: $stateParams.serviceId
            });
        };

        $scope.removeImage = function (row) {
            var index = $scope.service.images.indexOf(row);
            if (index !== -1) {
                $scope.service.images.splice(index, 1);
            }
        };

        $scope.addImage = function () {
            $scope.service.images.push({
                name: $scope.imageName,
                active: true,
                volumes: [],
                ports: []
            });
            $scope.imageName = '';
            $scope.imageIsActive = true;
        };

        $scope.addPort = function (image) {
            image.ports.push($scope.port);
            $scope.port = {};
        };

        $scope.removePort = function (image, port) {
            image.ports.splice(image.ports.indexOf(port), 1);
        };

        $scope.addVariable = function (image) {
            image.variables.push($scope.variable);
            $scope.variable = {};
        };

        $scope.removeVariable = function (image, variable) {
            image.variables.splice(image.variables.indexOf(variable), 1);
        };

        $scope.addVolume = function (image) {
            image.volumes.push($scope.volume);
            $scope.volume = {};
        };

        $scope.removeVolume = function (image, volume) {
            image.volumes.splice(image.volumes.indexOf(volume), 1);
        };

    }
]);
