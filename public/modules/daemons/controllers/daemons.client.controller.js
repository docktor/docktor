'use strict';

angular.module('daemons').controller('DaemonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'Daemon', 'Sites',
    function ($scope, $stateParams, $location, Authentication, Daemons, Daemon, Sites) {
        $scope.authentication = Authentication;
        $scope.positions = {};

        //TODO Grafana URL -> Admin Parameter
        // See https://github.com/docktor/docktor/issues/64
        $scope.grafanaUrl = 'http://' + $location.host() + ':8090/#/dashboard/script/docktor.js';

        $scope.patternTitle = /^[a-zA-Z0-9_]{1,200}$/;

        $scope.daemonsInitialized = false;

        $scope.markerInfo = '';
        $scope.sites = {};
        $scope.sites.all = Sites.query();

        $scope.port = {'protocol': 'tcp'};
        $scope.parameter = {};
        $scope.displayFormParameter = false;
        $scope.variable = {};
        $scope.displayFormVariable = false;

        $scope.submitForm = function () {
            if ($scope.daemon._id) {
                $scope.update();
            } else {
                $scope.create();
            }
        };

        $scope.create = function () {
            var daemon = $scope.daemon;
            $scope.daemon.site = $scope.daemon.selectSite._id;
            daemon.$save(function (response) {
                $location.path('admin/daemons/edit/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (daemon) {
            if (daemon) {
                daemon.$remove(function () {
                    $location.path('admin/daemons');
                });
            }
        };

        $scope.update = function (withRedirect) {
            $scope.daemon.site = $scope.daemon.selectSite._id;
            var daemon = $scope.daemon;
            daemon.$update(function () {
                if (withRedirect === true) {
                    $location.path('admin/daemons/view/' + daemon._id);
                }
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
                $scope.daemon.timedout = 30000;
                $scope.daemon.protocol = 'http';
            }
        };

        $scope.find = function () {
            Daemons.query(function (daemons) {
                $scope.daemons = daemons;
                angular.forEach($scope.daemons, function (daemon, key) {
                    daemon.cadvisorUrl = Daemon.getcAdvisorUrl(daemon);
                    Daemon.getDetails(daemon);
                    if (!$scope.positions[daemon.site._id])
                        $scope.positions[daemon.site._id] = {};
                    $scope.positions[daemon.site._id].site = daemon.site;
                    if (!$scope.positions[daemon.site._id].daemons)
                        $scope.positions[daemon.site._id].daemons = [];
                    $scope.positions[daemon.site._id].daemons.push(daemon);
                });
                $scope.daemonsInitialized = true;
                $scope.initMap();
            });
        };

        $scope.initMap = function () {
            var markers = {};
            var center = {};

            angular.forEach($scope.positions, function (position, idSite) {
                var site = position.site;
                center = {
                    lat: site.latitude,
                    lng: site.longitude,
                    zoom: 4
                };

                markers[idSite] = {
                    lat: site.latitude,
                    lng: site.longitude,
                    message: site.title,
                    focus: true
                };
            });

            $scope.markers = markers;
            $scope.center = center;
        };

        $scope.$on('leafletDirectiveMarker.click', function (e, args) {
            $scope.searchDaemon = $scope.positions[args.markerName].site.title;
        });

        $scope.addParameter = function () {
            $scope.daemon.parameters.push($scope.parameter);
            $scope.parameter = {};
            $scope.update(true);
        };

        $scope.removeParameter = function (parameter) {
            $scope.daemon.parameters.splice($scope.daemon.parameters.indexOf(parameter), 1);
            $scope.update(true);
        };

        $scope.addPort = function () {
            $scope.daemon.ports.push($scope.port);
            $scope.port = {'protocol': 'tcp'};
            $scope.update(true);
        };

        $scope.removePort = function (port) {
            $scope.daemon.ports.splice($scope.daemon.ports.indexOf(port), 1);
            $scope.update(true);
        };

        $scope.addVariable = function () {
            $scope.daemon.variables.push($scope.variable);
            $scope.variable = {};
            $scope.update(true);
        };

        $scope.removeVariable = function (variable) {
            $scope.daemon.variables.splice($scope.daemon.variables.indexOf(variable), 1);
            $scope.update(true);
        };

        $scope.addVolume = function () {
            $scope.daemon.volumes.push($scope.volume);
            $scope.volume = {};
            $scope.update(true);
        };

        $scope.removeVolume = function (volume) {
            $scope.daemon.volumes.splice($scope.daemon.volumes.indexOf(volume), 1);
            $scope.update(true);
        };

    }
]);
