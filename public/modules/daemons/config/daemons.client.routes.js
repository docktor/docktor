'use strict';

// Setting up route
angular.module('daemons').config(['$stateProvider',
    function ($stateProvider) {
        // Daemons state routing
        $stateProvider.
            state('listDaemons', {
                url: '/daemons',
                templateUrl: 'modules/daemons/views/list-daemons.client.view.html'
            }).
            state('createDaemon', {
                url: '/daemons/create',
                templateUrl: 'modules/daemons/views/create-daemon.client.view.html'
            }).
            state('viewContainers', {
                url: '/daemons/view/containers/:daemonId',
                templateUrl: 'modules/daemons/views/view-containers-daemon.client.view.html'
            }).
            state('viewImages', {
                url: '/daemons/view/images/:daemonId',
                templateUrl: 'modules/daemons/views/view-images-daemon.client.view.html'
            }).
            state('viewDaemon', {
                url: '/daemons/view/:daemonId',
                templateUrl: 'modules/daemons/views/view-daemon.client.view.html'
            }).
            state('editDaemon', {
                url: '/daemons/edit/:daemonId',
                templateUrl: 'modules/daemons/views/edit-daemon.client.view.html'
            });
    }
]);