'use strict';

angular.module('services').controller('ServicesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Services',
    function ($scope, $stateParams, $location, Authentication, Services) {
        $scope.authentication = Authentication;

        $scope.patternTitle = /^[a-zA-Z0-9_]{1,200}$/;

        $scope.displayFormImage = false;
        $scope.parameter = {};
        $scope.displayFormParameter = false;
        $scope.port = {'protocol': 'tcp'};
        $scope.displayFormPort = false;
        $scope.variable = {};
        $scope.displayFormVariable = false;
        $scope.volume = {};
        $scope.displayFormVolume = false;

        $scope.displayFormCommand = false;

        $scope.submitForm = function () {
            if ($scope.service._id) {
                $scope.update();
            } else {
                $scope.create();
            }
        };

        $scope.create = function () {
            $scope.service.$save(function (response) {
                $location.path('admin/services/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.update = function () {
            var service = $scope.service;
            service.$update(function () {
                $location.path('admin/services/' + service._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (service) {
            if (service) {
                service.$remove(function () {
                    $location.path('admin/services');
                });
            }
        };

        $scope.find = function () {
            $scope.services = Services.query();
        };

        $scope.findOne = function () {
            if ($stateParams.serviceId) {
                $scope.service = Services.get({
                    serviceId: $stateParams.serviceId
                });
            } else {
                $scope.service = new Services();
            }
        };

        $scope.addImage = function () {
            $scope.service.images.push({
                name: $scope.imageName,
                active: true,
                parameters: [],
                volumes: [],
                ports: []
            });
            $scope.imageName = '';
            $scope.imageIsActive = true;
        };

        $scope.removeImage = function (image) {
            $scope.service.images.splice($scope.service.images.indexOf(image), 1);
        };

        $scope.addParameter = function (image) {
            image.parameters.push($scope.parameter);
            $scope.parameter = {};
        };

        $scope.removeParameter = function (image, parameter) {
            image.parameters.splice(image.parameters.indexOf(parameter), 1);
        };

        $scope.addPort = function (image) {
            image.ports.push($scope.port);
            $scope.port = {'protocol': 'tcp'};
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

        $scope.addCommand = function () {
            $scope.service.commands.push({
                name: $scope.commandName,
                exec: $scope.commandExec
            });
            $scope.commandName = '';
            $scope.commandExec = '';
        };

        $scope.removeCommand = function (command) {
            $scope.service.commands.splice($scope.service.commands.indexOf(command), 1);
        };

        $scope.addUrl = function () {
            $scope.service.urls.push({
                label: $scope.urlLabel,
                url: $scope.urlUrl
            });
            $scope.urlLabel = '';
            $scope.urlUrl = '';
        };

        $scope.removeUrl = function (url) {
            $scope.service.urls.splice($scope.service.urls.indexOf(url), 1);
        };

    }
]);
