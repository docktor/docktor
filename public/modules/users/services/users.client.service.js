'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
    function ($resource) {
        return $resource('users/:userId', {
            userId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('users').factory('UsersService', ['$http',
    function ($http) {
        return {
            listUsersSimplified: function () {
                return $http.get('/users/simplified');
            },
            addGroup: function (userId, groupId) {
                return $http.put('/users/groups/' + userId + '/' + groupId, {groupId: groupId});
            },
            removeGroup: function (userId, groupId) {
                return $http.delete('/users/groups/' + userId + '/' + groupId);
            },
            addFavorite: function (userId, groupId) {
                return $http.put('/users/favorites/' + userId + '/' + groupId, {groupId: groupId});
            },
            removeFavorite: function (userId, groupId) {
                return $http.delete('/users/favorites/' + userId + '/' + groupId);
            },
            me: function () {
                return $http.get('/users/me');
            }
        };
    }
]);
