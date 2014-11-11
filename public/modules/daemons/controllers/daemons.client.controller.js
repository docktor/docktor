'use strict';

angular.module('daemons').controller('DaemonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'Daemon',
    function ($scope, $stateParams, $location, Authentication, Daemons, Daemon) {
        $scope.authentication = Authentication;
        $scope.positions = [];

        $scope.create = function () {
            var daemon = new Daemons({
                name: this.name,
                protocol: this.protocol,
                host: this.host,
                port: this.port,
                timedout: this.timedout,
                ca: this.ca,
                cert: this.cert,
                key: this.key,
                volume: this.volume,
                cadvisorApi: this.cadvisorApi,
                description: this.description
            });
            daemon.$save(function (response) {
                $location.path('daemons/view/' + response._id);

                $scope.name = '';
                $scope.protocol = '';
                $scope.host = '';
                $scope.port = '';
                $scope.timedout = 5000;
                $scope.ca = '';
                $scope.cert = '';
                $scope.key = '';
                $scope.volume = '';
                $scope.cadvisorApi = '';
                $scope.description = '';
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
            var daemon = $scope.daemon;
            daemon.$update(function () {
                $location.path('daemons/view/' + daemon._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        var markers = [];
        $scope.find = function () {
            Daemons.query(function (daemons) {
                $scope.daemons = daemons;
                var i = 0;
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
                    console.log('daemon.latitude:');
                    console.log(daemon.latitude);
                    if (daemon.latitude && daemon.longitude) {
                        markers[i] = new google.maps.Marker({
                            title: daemon.name
                        });
                        var latlng = new google.maps.LatLng(daemon.latitude, daemon.longitude);
                        markers[i].setPosition(latlng);
                        markers[i].setMap(map);
                        i++;
                    }
                });

                map.setCenter(pos);
            });
        });
    }
]);
