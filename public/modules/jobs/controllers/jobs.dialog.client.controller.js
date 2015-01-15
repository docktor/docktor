'use strict';

angular.module('jobs').controller('JobDialogController', ['$scope', '$mdDialog', 'info', 'currentJob',
    function ($scope, $mdDialog, info, currentJob) {

        $scope.job = currentJob;

        $scope.job.lastExecutionDisplay = moment(currentJob.lastExecution).fromNow();

        $scope.info = info;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }
]);
