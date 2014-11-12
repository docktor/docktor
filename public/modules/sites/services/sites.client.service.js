'use strict';

//Sites site used for communicating with the sites REST endpoints
angular.module('sites').factory('Sites', ['$resource',
    function ($resource) {
        return $resource('sites/:siteId', {
            siteId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
