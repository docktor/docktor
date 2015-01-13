'use strict';

angular.module('jobs').controller('JobDialogController', ['$scope', '$mdDialog', 'info', 'currentJob',
    function ($scope, $mdDialog, info, currentJob) {
        $scope.job = currentJob;
        $scope.info = info;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }
]);
