'use strict';

angular.module('groups').controller('GroupsMonitoringController', ['$rootScope', '$scope', 'Socket',
    function ($rootScope, $scope, Socket) {
        Socket.on('container.stat.start', function() {
            console.log('Starting docker stat long-polling');
        });
        Socket.on('container.stat.data', function(message) {
            console.log(message);
        });
        Socket.on('container.stat.error', function(message) {
            console.log(message);
        });
        Socket.on('container.stat.stop', function() {
            console.log('Stop docker stat long-polling');
        });
        Socket.on('container.stat.timeout', function() {
            console.log('Timeout of docker stat long-polling');
        });

        $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Series A', 'Series B'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];

    }
]);
