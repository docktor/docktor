'use strict';

// Setting up route
angular.module('jobs').config(['$stateProvider',
    function ($stateProvider) {
        // Jobs state routing
        $stateProvider.
            state('listJobs', {
                url: '/admin/jobs',
                templateUrl: 'modules/jobs/views/list-jobs.client.view.html'
            });
    }
]);
