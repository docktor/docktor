'use strict';

angular.module('daemons').controller('DaemonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'Daemon', 'Sites',
    function ($scope, $stateParams, $location, Authentication, Daemons, Daemon, Sites) {
        $scope.authentication = Authentication;
        $scope.positions = {};

        $scope.mapInitialized = false;
        $scope.mapView = false;
        $scope.daemonsInitialized = false;

        $scope.markerInfo = '';
        $scope.sites = {};
        $scope.sites.all = Sites.query();

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

        $scope.findOne = function () {
            if ($stateParams.daemonId) {
                Daemons.get({
                    daemonId: $stateParams.daemonId
                }, function (daemon) {
                    $scope.daemon = daemon;
                    $scope.daemon.selectSite = $scope.daemon.site;
                    Daemon.getDetails(daemon);
                });
            } else {
                $scope.daemon = new Daemons();
            }
        };

        $scope.find = function () {
            Daemons.query(function (daemons) {
                $scope.daemons = daemons;
                angular.forEach($scope.daemons, function (daemon, key) {
                    daemon.cadvisorUrl = daemon.cadvisorApi.substring(0, daemon.cadvisorApi.indexOf('/api'));
                    Daemon.getDetails(daemon);
                    if (!$scope.positions[daemon.site._id])
                        $scope.positions[daemon.site._id] = {};
                    $scope.positions[daemon.site._id]['site'] = daemon.site;
                    if (!$scope.positions[daemon.site._id]['daemons'])
                        $scope.positions[daemon.site._id]['daemons'] = [];
                    $scope.positions[daemon.site._id]['daemons'].push(daemon);
                });
                $scope.daemonsInitialized = true;
            });
        };

        $scope.$on('mapInitialized', function (event, map) {
            $scope.map = map;
            $scope.mapInitialized = true;
        });

        $scope.initMap = function () {

            if ($scope.daemonsInitialized && $scope.mapInitialized) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = new google.maps.LatLng(position.coords.latitude,
                        position.coords.longitude);

                    var i = 0;
                    var markers = [];
                    angular.forEach($scope.positions, function (position, key) {
                        var site = position.site;
                        var daemons = position.daemons;
                        if (site.latitude && site.longitude) {
                            markers[i] = new google.maps.Marker({
                                title: site.title
                            });

                            var latlng = new google.maps.LatLng(site.latitude, site.longitude);
                            markers[i].setPosition(latlng);
                            markers[i].setMap($scope.map);

                            google.maps.event.addListener(markers[i], 'click', function () {
                                var d = '';
                                angular.forEach(daemons, function (daemon, key) {
                                    d = d + daemon.name + '<br>';
                                });
                                $scope.markerInfo = 'Site ' + site.title + '<hr>' + d;
                                $scope.$apply();
                            });

                            i++;
                        }
                    });

                    $scope.map.setCenter(pos);
                });
                $scope.mapView = true;
            }
        }
    }
]);
