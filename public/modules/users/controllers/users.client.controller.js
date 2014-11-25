'use strict';

angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Users',
    function ($scope, $stateParams, $location, Authentication, Users) {
        $scope.authentication = Authentication;

        $scope.roles = ['user', 'admin'];

        $scope.update = function () {
            var user = $scope.user;
            user.$update(function () {
                $location.path('users/' + user._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (user) {
            if (user) {
                user.$remove();
                for (var i in $scope.users) {
                    if ($scope.users[i] === user) {
                        $scope.users.splice(i, 1);
                    }
                }
            } else {
                $scope.user.$remove(function () {
                    $location.path('users');
                });
            }
        };

        $scope.find = function () {
            $scope.users = Users.query();
        };

        $scope.findOne = function () {
            if ($stateParams.userId) {
                Users.get({
                    userId: $stateParams.userId
                }, function (user) {
                    $scope.user = user;
                    $scope.user.roleSelect = user.roles[0];
                });
            }
        };
    }
]);
