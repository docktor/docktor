'use strict';

angular.module('daemons').factory('Images', ['$http',
    function ($http) {
        return {
            inspectImage: function (daemonId, imageId) {
                return $http.get('/daemons/docker/image/inspect/' + daemonId + '/' + imageId);
            },
            pullImage: function (daemonId, imageName) {
                var data = { name : imageName};
                return $http.post('/daemons/docker/image/pull/' + daemonId + '/', data);
            },
            removeImage: function (daemonId, image, cbSuccess, cbError) {
                return $http.get('/daemons/docker/image/remove/' + daemonId + '/' + image.Id).
                    success(function (data, status, headers, config) {
                        cbSuccess(image, data);
                    }).
                    error(function (data, status, headers, config) {
                        cbError(image, data);
                    });
            }
        };
    }
]);