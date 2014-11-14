'use strict';

// Setting up route
angular.module('sites').config(['$stateProvider',
    function ($stateProvider) {
        // Sites state routing
        $stateProvider.
            state('listSites', {
                url: '/sites',
                templateUrl: 'modules/sites/views/list-sites.client.view.html'
            }).
            state('createSite', {
                url: '/sites/create',
                templateUrl: 'modules/sites/views/edit-site.client.view.html'
            }).
            state('viewSite', {
                url: '/sites/:siteId',
                templateUrl: 'modules/sites/views/view-site.client.view.html'
            }).
            state('editSite', {
                url: '/sites/:siteId/edit',
                templateUrl: 'modules/sites/views/edit-site.client.view.html'
            });
    }
]);
