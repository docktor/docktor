'use strict';

// Setting up route
angular.module('services').config(['$stateProvider',
    function ($stateProvider) {
        // Services state routing
        $stateProvider.
            state('listServices', {
                url: '/admin/services',
                templateUrl: 'modules/services/views/list-services.client.ui.html'
            }).
            state('createService', {
                url: '/admin/services/create',
                templateUrl: 'modules/services/views/edit-service.client.ui.html'
            }).
            state('viewService', {
                url: '/admin/services/:serviceId',
                templateUrl: 'modules/services/views/view-service.client.ui.html'
            }).
            state('editService', {
                url: '/admin/services/:serviceId/edit',
                templateUrl: 'modules/services/views/edit-service.client.ui.html'
            });
    }
]);
