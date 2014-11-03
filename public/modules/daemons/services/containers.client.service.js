'use strict';

angular.module('daemons').factory('Containers', ['$http',
    function ($http) {
        return {
            inspectContainer: function (daemonId, containerId) {
                return $http.get('/daemons/docker/container/inspect/' + daemonId + '/' + containerId);
            },
            statsContainer: function (daemonId, containerId) {
                return $http.get('/daemons/docker/container/stats/' + daemonId + '/' + containerId);
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