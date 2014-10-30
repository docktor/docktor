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
            create: function (groupId, containerId) {
                return this.action('create', groupId, containerId);
            },
            start: function (groupId, containerId) {
                return this.action('start', groupId, containerId);
            },
            stop: function (groupId, containerId) {
                return this.action('stop', groupId, containerId);
            },
            pause: function (groupId, containerId) {
                return this.action('pause', groupId, containerId);
            },
            unpause: function (groupId, containerId) {
                return this.action('unpause', groupId, containerId);
            },
            kill: function (groupId, containerId) {
                return this.action('kill', groupId, containerId);
            },
            remove: function (groupId, containerId) {
                return this.action('remove', groupId, containerId);
            },
            action: function (action, groupId, containerId) {
                return $http.get('/groups/container/' + action + '/' + groupId + '/' + containerId);
            }
        };
    }
]);
