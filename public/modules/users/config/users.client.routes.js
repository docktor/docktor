'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider.
            state('profile', {
                url: '/settings/profile',
                templateUrl: 'modules/users/views/settings/edit-profile.client.ui.html'
            }).
            state('password', {
                url: '/settings/password',
                templateUrl: 'modules/users/views/settings/change-password.client.ui.html'
            }).
            state('signup', {
                url: '/signup',
                templateUrl: 'modules/users/views/authentication/signup.client.ui.html'
            }).
            state('signin', {
                url: '/signin',
                templateUrl: 'modules/users/views/authentication/signin.client.ui.html'
            }).
            state('forgot', {
                url: '/password/forgot',
                templateUrl: 'modules/users/views/password/forgot-password.client.ui.html'
            }).
            state('reset-invlaid', {
                url: '/password/reset/invalid',
                templateUrl: 'modules/users/views/password/reset-password-invalid.client.ui.html'
            }).
            state('reset-success', {
                url: '/password/reset/success',
                templateUrl: 'modules/users/views/password/reset-password-success.client.ui.html'
            }).
            state('reset', {
                url: '/password/reset/:token',
                templateUrl: 'modules/users/views/password/reset-password.client.ui.html'
            });
    }
]);
