'use strict';

// Setting up route
angular.module('sites').config(['$stateProvider',
    function ($stateProvider) {
        // Sites state routing
        $stateProvider.
            state('listSites', {
                url: '/admin/sites',
                templateUrl: 'modules/sites/views/list-sites.client.view.html'
            }).
            state('createSite', {
                url: '/admin/sites/create',
                templateUrl: 'modules/sites/views/edit-site.client.view.html'
            }).
            state('viewSite', {
                url: '/admin/sites/:siteId',
                templateUrl: 'modules/sites/views/view-site.client.view.html'
            }).
            state('editSite', {
                url: '/admin/sites/:siteId/edit',
                templateUrl: 'modules/sites/views/edit-site.client.view.html'
            }).
            state('viewUser', {
                url: '/admin/users/:userId',
                templateUrl: 'modules/users/views/users/view-user.client.view.html'
            }).
            state('listUsers', {
                url: '/admin/users',
                templateUrl: 'modules/users/views/users/list-users.client.view.html'
            }).
            state('editUser', {
                url: '/admin/users/:userId/edit',
                templateUrl: 'modules/users/views/users/edit-user.client.view.html'
            });
    }
]);
