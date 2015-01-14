'use strict';

angular.module('jobs').controller('JobsOverviewController', ['$scope', 'Authentication', 'GroupsServices', 'ServicesServices', 'Toasts', '$mdDialog',
    function ($scope, Authentication, GroupsServices, ServicesServices, Toasts, $mdDialog) {
        $scope.authentication = Authentication;

        $scope.overview = {};

        $scope.find = function () {

            GroupsServices.getListSimplified().success(function (groups) {
                $scope.groups = groups;

                ServicesServices.getListSimplified().success(function (services) {
                    $scope.services = services;

                    angular.forEach($scope.groups, function (group, keyGroup) {
                        $scope.overview[group._id] = {
                            'groupId': group._id,
                            'title': group.title
                        };

                        $scope.overview[group._id].services = {};
                        angular.forEach($scope.services, function (service, keyService) {
                            $scope.overview[group._id].services[service._id] = {'title': service.title};
                            $scope.overview[group._id].services[service._id].containers = {};
                        });
                    });

                    console.log('GROUPS');
                    console.log($scope.overview);

                    GroupsServices.getJobs().success(function (response) {
                        $scope.jobs = response;

                        angular.forEach($scope.jobs, function (groupJobs, keyJob) {
                            $scope.overview[groupJobs._id.groupId].services[groupJobs._id.serviceId].containers[groupJobs.containerId] = {};
                            $scope.overview[groupJobs._id.groupId].services[groupJobs._id.serviceId].containers[groupJobs.containerId].jobs = {};
                            angular.forEach(groupJobs.jobs, function (job, keyJob) {
                                // use if ! to keep the newest jobId
                                if (!$scope.overview[groupJobs._id.groupId].services[groupJobs._id.serviceId].containers[groupJobs.containerId].jobs[job.jobId]) {
                                    $scope.overview[groupJobs._id.groupId].services[groupJobs._id.serviceId].containers[groupJobs.containerId].jobs[job.jobId] = {
                                        '_id': groupJobs._id,
                                        'status': job.status,
                                        'name': job.name,
                                        'lastExecution': job.lastExecution
                                    };
                                }
                            });
                        });
                    }).error(function (err, status, headers, config) {
                        var title = 'Error - ' + moment().format('hh:mm:ss');
                        Toasts.addToast(err, 'danger', title);
                    });


                }).error(function (err, status, headers, config) {
                    var title = 'Error - ' + moment().format('hh:mm:ss');
                    Toasts.addToast(err, 'danger', title);
                });

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
