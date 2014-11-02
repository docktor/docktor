'use strict';

angular.module('daemons').controller('DaemonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons', 'DaemonsDocker',
    function ($scope, $stateParams, $location, Authentication, Daemons, DaemonsDocker) {
        $scope.authentication = Authentication;

        $scope.create = function () {
            var daemon = new Daemons({
                name: this.name,
                protocol: this.protocol,
                host: this.host,
                port: this.port,
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

        $scope.find = function () {
            $scope.daemons = Daemons.query(function () {
                angular.forEach($scope.daemons, function () {
                    var daemon = $scope.daemons[0];
                    DaemonsDocker.info(daemon._id).
                        success(function (info) {
                            daemon.dockerInfo = info;
                        })
                        .error(function (resp) {
                            console.log('Error with DaemonsDocker.info on :' + daemon._id + ':' + resp);
                        });
                });
            });
        };

        $scope.findOne = function () {
            $scope.daemon = Daemons.get({
                daemonId: $stateParams.daemonId
            });


            DaemonsDocker.info($stateParams.daemonId).
                success(function (info) {
                    $scope.dockerInfo = info;
                })
                .error(function (resp) {
                    console.log('Error with DaemonsDocker.info:' + resp);
                });
        };
    }
]);