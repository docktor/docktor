'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'RoleService', 'Menus',
    function ($scope, $http, $location, Authentication, RoleService, Menus) {
        $scope.authentication = Authentication;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');

        $scope.signup = function () {
            $http.post('/auth/signup', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;
                $scope.authentication.isAdmin = RoleService.validateRoleAdmin(response);
                Menus.refreshFavorites();

                // And redirect to the index page
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.signin = function () {
            $http.post('/auth/signin', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;
                $scope.authentication.isAdmin = RoleService.validateRoleAdmin(response);
                Menus.refreshFavorites();

                // And redirect to the index page
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
    }
]);
