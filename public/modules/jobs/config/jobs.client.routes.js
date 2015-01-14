'use strict';

// Setting up route
angular.module('jobs').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider.
            state('listJobsHistory', {
                url: '/admin/jobs/history',
                templateUrl: 'modules/jobs/views/list-jobs-history.client.view.html'
            }).
            state('listJobsOverview', {
                url: '/admin/jobs/overview',
                templateUrl: 'modules/jobs/views/list-jobs-overview.client.view.html'
            });
    }
]);
