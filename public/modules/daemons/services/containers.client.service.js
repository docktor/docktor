'use strict';

angular.module('daemons').factory('Containers', ['$http', 'DaemonsDocker',
    function ($http, DaemonsDocker) {
        return {
            inspectContainer: function (daemonId, containerId) {
                return $http.get('/daemons/docker/container/inspect/' + daemonId + '/' + containerId);
            },
            actionContainer: function (action, daemonId, container, cbSuccess, index, cbSuccessEnd, cbError) {
                return $http.get('/daemons/docker/container/' + action + '/' + daemonId + '/' + container.Id).
                    success(function (data, status, headers, config) {
                        container.loading = false;
                        cbSuccess(container, data, index, cbSuccessEnd);
                    }).
                    error(function (data, status, headers, config) {
                        container.loading = false;
                        cbError(container, data, index);
                    });
            },
            statsContainer: function (daemonId, containerId) {
                return $http.get('/daemons/docker/container/stats/' + daemonId + '/' + containerId);
            }
        };
    }
]);
