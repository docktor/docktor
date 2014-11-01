'use strict';

//Groups service used for communicating with the groups REST endpoints
angular.module('groups').factory('Groups', ['$resource',
    function ($resource) {
        return $resource('groups/:groupId', {
            groupId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('groups').factory('GroupsServices', ['$http',
    function ($http) {
        return {
            inspect: function (groupId, containerId) {
                return $http.get('/groups/container/inspect/' + groupId + '/' + containerId);
            },
            action: function (action, groupId, container, cbSuccess, cbError) {
                return $http.get('/groups/container/' + action + '/' + groupId + '/' + container._id).
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
