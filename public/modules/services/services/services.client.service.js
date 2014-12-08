'use strict';

//Services service used for communicating with the services REST endpoints
angular.module('services').factory('Services', ['$resource',
    function ($resource) {
        return $resource('services/:serviceId', {
            serviceId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('services').factory('ServicesServices', ['$http',
    function ($http) {
        return {
            getCommands: function (serviceId, groupId) {
                return $http.get('/services/commands/' + serviceId + '/' + groupId);
            },
            getUrls: function (serviceId, groupId) {
                return $http.get('/services/urls/' + serviceId + '/' + groupId);
            }
        };
    }
]);
