'use strict';

angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Users', 'Groups', 'UsersService',
    function ($scope, $stateParams, $location, Authentication, Users, Groups, UsersService) {
        $scope.authentication = Authentication;

        $scope.roles = ['user', 'admin'];

        $scope.groupsSelected = [];

        $scope.update = function () {
            var userToEdit = $scope.userToEdit;
            userToEdit.groups = [];
            angular.forEach($scope.groupsSelected, function (group, key) {
                userToEdit.groups.push(group._id);
            });
            userToEdit.$update(function () {
                $location.path('admin/users/' + userToEdit._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (uToDelete) {
            var usertoDelete = uToDelete;
            usertoDelete.$remove(function () {
                $location.path('admin/users');
            });
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
                    }, function (userToEdit) {
                        angular.forEach(groups, function (group, key) {
                            if (_.where(userToEdit.groups, {'_id': group._id}).length > 0) {
                                $scope.groupsSelected.push(group);
                                groups = _.without(groups, group);
                            }
                        });
                        $scope.userToEdit = userToEdit;
                        $scope.groups.all = groups;
                    });
                }
            });
        };

        $scope.addGroup = function (group) {
            UsersService.addGroup($scope.userToEdit._id, group._id)
                .success(function () {
                    $scope.userToEdit.groups = _.union($scope.userToEdit.groups, [group._id]);
                    $scope.groupsSelected.push(group);
                    $scope.groups.all = _.without($scope.groups.all, group);
                });
        };

        $scope.removeGroup = function (group) {
            UsersService.removeGroup($scope.userToEdit._id, group._id)
                .success(function () {
                    $scope.userToEdit.groups = _.without($scope.userToEdit.groups, group._id);
                    $scope.groupsSelected = _.without($scope.groupsSelected, group);
                    $scope.groups.all.push(group);
                });
        };
    }
]);
