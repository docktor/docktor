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
            getFreePorts: function (groupId) {
                return $http.get('/groups/ports/free/' + groupId);
            },
            getUsersOnGroup: function (groupId) {
                return $http.get('/groups/users/' + groupId);
            },
            getFreePortRangeOnContainer: function (containerId) {
                return $http.get('/groups/container/freeports/' + containerId);
            },
            inspect: function (groupId, containerId) {
                return $http.get('/groups/container/inspect/' + groupId + '/' + containerId);
            },
            exec: function (groupId, containerId, serviceId, cmdId) {
                return $http.get('/groups/exec/' + groupId + '/' + containerId + '/' + serviceId + '/' + cmdId);
            },
            action: function (action, groupId, container, cbSuccess, index, cbSuccessEnd, cbError) {
                return $http.get('/groups/container/' + action + '/' + groupId + '/' + container._id).
                    success(function (data, status, headers, config) {
                        cbSuccess(container, data, index, cbSuccessEnd);
                    }).
                    error(function (data, status, headers, config) {
                        cbError(container, data, index);
                    });
            }
        };
    }
]);
