'use strict';

// Setting up route
angular.module('daemons').config(['$stateProvider',
    function ($stateProvider) {
        // Daemons state routing
        $stateProvider.
            state('listDaemons', {
                url: '/admin/daemons',
                templateUrl: 'modules/daemons/views/list-daemons.client.view.html'
            }).
            state('createDaemon', {
                url: '/admin/daemons/create',
                templateUrl: 'modules/daemons/views/edit-daemon.client.view.html'
            }).
            state('viewContainers', {
                url: '/admin/daemons/view/containers/:daemonId',
                templateUrl: 'modules/daemons/views/view-containers-daemon.client.view.html'
            }).
            state('viewImages', {
                url: '/admin/daemons/view/images/:daemonId',
                templateUrl: 'modules/daemons/views/view-images-daemon.client.view.html'
            }).
            state('viewDaemon', {
                url: '/admin/daemons/view/:daemonId',
                templateUrl: 'modules/daemons/views/view-daemon.client.view.html'
            }).
            state('editDaemon', {
                url: '/admin/daemons/edit/:daemonId',
                templateUrl: 'modules/daemons/views/edit-daemon.client.view.html'
            });
    }
]);
