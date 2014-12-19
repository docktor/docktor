'use strict';

//Daemons service used for communicating with the daemons REST endpoints
angular.module('daemons').factory('Daemons', ['$resource',
    function ($resource) {
        return $resource('daemons/:daemonId', {
            daemonId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('daemons').factory('DaemonsDocker', ['$http',
    function ($http) {
        return {
            getInterval: function (current, previous) {
                var cur = new Date(current);
                var prev = new Date(previous);
                // ms -> ns.
                return (cur.getTime() - prev.getTime()) * 1000000;
            },
            infos: function (daemonId) {
                return $http.get('/daemons/docker/infos/' + daemonId);
            },
            listContainers: function (daemonId) {
                return $http.get('/daemons/docker/listContainers/' + daemonId);
            },
            listImages: function (daemonId) {
                return $http.get('/daemons/docker/listImages/' + daemonId);
            },
            statsDaemon: function (daemonId) {
                return $http.get('/daemons/docker/stats/' + daemonId);
            }
        };
    }
]);
