'use strict';

angular.module('jobs').controller('JobsHistoryController', ['$scope', 'Authentication', 'GroupsServices', 'Toasts', '$mdDialog',
    function ($scope, Authentication, GroupsServices, Toasts, $mdDialog) {
        $scope.authentication = Authentication;

        $scope.find = function () {
            GroupsServices.getJobs().success(function (response) {
                $scope.groups = response;
            }).error(function (err, status, headers, config) {
                var title = 'Error - ' + moment().format('hh:mm:ss');
                Toasts.addToast(err, 'danger', title);
            });
        };

        $scope.showInfo = function (info, job) {
            $mdDialog.show({
                controller: 'JobDialogController',
                templateUrl: 'modules/jobs/views/job.dialog.template.html',
                locals: {currentJob: job, info: info}
            });
        };
    }
]);
