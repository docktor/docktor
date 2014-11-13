'use strict';

angular.module('daemons').controller('DaemonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'Daemon', 'Sites',
    function ($scope, $stateParams, $location, Authentication, Daemons, Daemon, Sites) {
        $scope.authentication = Authentication;
        $scope.positions = [];

        $scope.sites = {};
        $scope.sites.all = Sites.query();

        $scope.daemon = new Daemons();

        $scope.submitForm = function () {

            if ($scope.daemon._id) {
                $scope.update();
            } else {
                $scope.create()
            }

        };

        $scope.create = function () {
            var daemon = $scope.daemon;
            $scope.daemon.site = $scope.daemon.selectSite._id;
            daemon.$save(function (response) {
                $location.path('daemons/view/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (daemon) {
            if (daemon) {
                daemon.$remove();
                for (var i in $scope.daemons) {
                    if ($scope.daemons[i] === daemon) {
                        $scope.daemons.splice(i, 1);
                    }
                }
            } else {
                $scope.daemon.$remove(function () {
                    $location.path('daemons');
                });
            }
        };

        $scope.update = function () {
            $scope.daemon.site = $scope.daemon.selectSite._id;
            var daemon = $scope.daemon;
            daemon.$update(function () {
                $location.path('daemons/view/' + daemon._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function () {
            Daemons.query(function (daemons) {
                $scope.daemons = daemons;
                angular.forEach($scope.daemons, function (daemon, key) {
                    daemon.cadvisorUrl = daemon.cadvisorApi.substring(0, daemon.cadvisorApi.indexOf('/api'));
                    Daemon.getDetails(daemon);
                });
            });
        };

        $scope.findOne = function () {
            Daemons.get({
                daemonId: $stateParams.daemonId
            }, function (daemon) {
                $scope.daemon = daemon;
                $scope.daemon.selectSite = $scope.daemon.site;
                Daemon.getDetails(daemon);
            });
        };

        $scope.$on('mapInitialized', function (event, map) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);

                var i = 0;
                var markers = [];
                angular.forEach($scope.daemons, function (daemon, key) {
                    if (daemon.latitude && daemon.longitude) {
// TODO use localization of site
                        markers[i] = new google.maps.Marker({
                            title: daemon.name
                        });

                        var latlng = new google.maps.LatLng(daemon.latitude, daemon.longitude);
                        markers[i].setPosition(latlng);
                        markers[i].setMap(map);

                        google.maps.event.addListener(markers[i], 'click', function () {
                            alert('TODO');
                        });

                        i++;
                    }
                });

                map.setCenter(pos);
            });
        });
    }
]);
