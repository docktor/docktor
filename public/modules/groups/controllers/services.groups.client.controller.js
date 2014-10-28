'use strict';

angular.module('groups').controller('ServicesGroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups', 'Services',
    function ($scope, $stateParams, $location, Authentication, Groups, Services) {
        $scope.authentication = Authentication;

        $scope.findOne = function () {
            $scope.group = Groups.get({
                groupId: $stateParams.groupId
            });

            $scope.services = {};
            $scope.services.all = Services.query();
        };
    }
]);