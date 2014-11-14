'use strict';

angular.module('sites').controller('SitesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Sites',
    function ($scope, $stateParams, $location, Authentication, Sites) {
        $scope.authentication = Authentication;

        $scope.displayFormImage = false;
        $scope.port = {};
        $scope.displayFormPort = false;
        $scope.variable = {};
        $scope.displayFormVariable = false;
        $scope.volume = {};
        $scope.displayFormVolume = false;

        $scope.submitForm = function () {
            if ($scope.site._id) {
                $scope.update();
            } else {
                $scope.create()
            }
        };

        $scope.create = function () {
            $scope.site.$save(function (response) {
                $location.path('sites/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.update = function () {
            var site = $scope.site;
            site.$update(function () {
                $location.path('sites/' + site._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (site) {
            if (site) {
                site.$remove();
                for (var i in $scope.sites) {
                    if ($scope.sites[i] === site) {
                        $scope.sites.splice(i, 1);
                    }
                }
            } else {
                $scope.site.$remove(function () {
                    $location.path('sites');
                });
            }
        };

        $scope.find = function () {
            $scope.sites = Sites.query();
        };

        $scope.findOne = function () {
            if ($stateParams.siteId) {
                $scope.site = Sites.get({
                    siteId: $stateParams.siteId
                });
            } else {
                $scope.site = new Sites();
            }
        };

        $scope.removeImage = function (row) {
            var index = $scope.site.images.indexOf(row);
            if (index !== -1) {
                $scope.site.images.splice(index, 1);
            }
        };

        $scope.addImage = function () {
            $scope.site.images.push({
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
