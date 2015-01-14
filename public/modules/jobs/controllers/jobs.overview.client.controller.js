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
                            'groupId' : group._id,
                            'title': group.title
                        };

                        $scope.overview[group._id].services = {};
                        angular.forEach($scope.services, function (service, keyService) {
                            $scope.overview[group._id].services[service._id] = {'title': service.title};
                            $scope.overview[group._id].services[service._id].jobs = {};
                        });
                    });

                    console.log('GROUPS');
                    console.log($scope.overview);

                    GroupsServices.getJobs().success(function (response) {
                        $scope.jobs = response;

                        angular.forEach($scope.jobs, function (groupsJobs, keyJob) {
                            angular.forEach(groupsJobs.jobs, function (job, keyJob) {
                                $scope.overview[groupsJobs._id.groupId].services[groupsJobs._id.serviceId].jobs[job.jobId] = {
                                    'status': job.status,
                                    'name': job.name,
                                    'lastExecution' : job.lastExecution
                                };
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
