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
            info: function (daemonId) {
                return $http.get('/daemons/docker/info/' + daemonId);
            },
            listContainers: function(daemonId) {
                return $http.get('/daemons/docker/listContainers/' + daemonId);
            },
            listImages: function(daemonId) {
                return $http.get('/daemons/docker/listImages/' + daemonId);
            }
        };
    }
]);