'use strict';

angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Users', 'Groups',
    function ($scope, $stateParams, $location, Authentication, Users, Groups) {
        $scope.authentication = Authentication;

        $scope.roles = ['user', 'admin'];

        $scope.groupsSelected = [];

        $scope.update = function () {
            var user = $scope.user;
            user.groups = [];
            angular.forEach($scope.groupsSelected, function (group, key) {
                user.groups.push(group._id);
            });
            user.$update(function () {
                $location.path('users/' + user._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (user) {
            if (user) {
                var usertoDelete = user;
                usertoDelete.$remove(function () {
                    $location.path('users');
                });
            }
        };

        $scope.find = function () {
            $scope.users = Users.query();
        };

        $scope.findOne = function () {
            Groups.query(function (groups) {
                $scope.groups = {};

                if ($stateParams.userId) {
                    Users.get({
                        userId: $stateParams.userId
                    }, function (user) {
                        $scope.user = user;
                        angular.forEach(groups, function (group, key) {
                            if (_.where($scope.user.groups, {'_id': group._id}).length > 0) {
                                $scope.groupsSelected.push(group);
                                groups = _.without(groups, group);
                            }
                        });
                        $scope.groups.all = groups;
                    });
                }
            });
        };

        $scope.addGroup = function (group) {
            $scope.user.groups = _.union($scope.user.groups, [group._id]);
            $scope.groupsSelected.push(group);
            $scope.groups.all = _.without($scope.groups.all, group);
        };

        $scope.removeGroup = function (group) {
            $scope.user.groups = _.without($scope.user.groups, group._id);
            $scope.groupsSelected = _.without($scope.groupsSelected, group);
            $scope.groups.all.push(group);
        };
    }
]);
