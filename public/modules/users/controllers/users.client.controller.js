'use strict';

angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Users', 'Groups',
    function ($scope, $stateParams, $location, Authentication, Users, Groups) {
        $scope.authentication = Authentication;

        $scope.roles = ['user', 'admin'];

        $scope.groups = {};
        $scope.groups.all = Groups.query();

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
                    $scope.user.groups = []
                });
            }
        };

        $scope.togGroup = function (group) {
            if ($scope.containsGroup(group)) {
                $scope.removeGroup(group);
            } else {
                $scope.addGroup(group);
            }
        };

        $scope.containsGroup = function (group) {
            return _.contains($scope.user.groups, group._id);
        };

        $scope.addGroup = function (group) {
            console.log('ADD ' + group._id);
            $scope.user.groups = _.union($scope.user.groups, [group._id]);
        };

        $scope.removeGroup = function (group) {
            console.log('DEL ' + group._id);
            $scope.user.groups = _.without($scope.user.groups, group._id);
        };
    }
]);
