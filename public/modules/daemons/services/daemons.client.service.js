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
            version: function (daemonId) {
                return $http.get('/daemons/docker/version/' + daemonId);
            },
            listContainers: function (daemonId) {
                return $http.get('/daemons/docker/listContainers/' + daemonId);
            },
            listImages: function (daemonId) {
                return $http.get('/daemons/docker/listImages/' + daemonId);
            },
            inspect: function (daemonId, containerId) {
                return $http.get('/daemons/docker/container/inspect/' + daemonId + '/' + containerId);
            },
            statsContainer: function (daemonId, containerId) {
                return $http.get('/daemons/docker/container/stats/' + daemonId + '/' + containerId);
            },
            statsDaemon: function (daemonId) {
                return $http.get('/daemons/docker/stats/' + daemonId);
            },
            machineInfo: function (daemonId) {
                return $http.get('/daemons/docker/machineInfo/' + daemonId);
            },
            actionContainer: function (action, daemonId, container, cbSuccess, cbError) {
                return $http.get('/daemons/docker/container/' + action + '/' + daemonId + '/' + container.Id).
                    success(function (data, status, headers, config) {
                        cbSuccess(container, data);
                    }).
                    error(function (data, status, headers, config) {
                        cbError(container, data);
                    });
            }
        };
    }
]);