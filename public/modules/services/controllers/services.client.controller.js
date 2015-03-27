'use strict';

angular.module('services').controller('ServicesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Services', 'Toasts', 'ServicesServices',
    function ($scope, $stateParams, $location, Authentication, Services, Toasts, ServicesServices) {
        $scope.authentication = Authentication;

        $scope.patternTitle = /^[a-zA-Z0-9_]{1,200}$/;

        var self = this;

        $scope.displayFormImage = false;
        $scope.parameter = {};
        $scope.displayFormParameter = false;
        $scope.port = {'protocol': 'tcp'};
        $scope.displayFormPort = false;
        $scope.variable = {};
        $scope.displayFormVariable = false;
        $scope.volume = {};
        $scope.displayFormVolume = false;

        $scope.displayFormCommand = false;
        $scope.commandRole = 'user';
        $scope.commandRoleName = '';

        $scope.isClean = function () {
            return angular.equals(self.serviceOriginal, $scope.service);
        };

        $scope.submitForm = function () {
            if ($scope.service._id) {
                $scope.update(true);
            } else {
                $scope.create();
            }
        };

        $scope.create = function () {
            $scope.service.$save(function (response) {
                $location.path('admin/services/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.update = function (redirect) {
            var service = $scope.service;
            service.$update(function () {
                if (redirect === true) {
                    $location.path('admin/services/' + service._id);
                } else {
                    Toasts.addToast('Service ' + service.title + ' successfully saved', 'success');
                }
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function (service) {
            if (service) {
                service.$remove(function () {
                    $location.path('admin/services');
                }, function (errorResponse) {
                    var title = 'Error - ' + moment().format('hh:mm:ss');
                    var err = [];
                    if (errorResponse.data.message) {
                        err.push(errorResponse.data.message);
                    } else {
                        err.push(errorResponse);
                    }
                    Toasts.addToast(err, 'danger', title);
                });
            }
        };

        $scope.find = function () {
            $scope.services = Services.query();
        };

        $scope.findOne = function () {
            if ($stateParams.serviceId) {
                Services.get({
                    serviceId: $stateParams.serviceId
                }, function (response) {
                    self.serviceOriginal = response;
                    $scope.service = new Services(self.serviceOriginal);
                }, function (err, status, headers, config) {
                    var title = 'Error getting service - ' + moment().format('hh:mm:ss');
                    Toasts.addToast(err, 'danger', title);
                });


            } else {
                $scope.service = new Services();
            }
        };

        $scope.addImage = function () {
            $scope.service.images.push({
                name: $scope.imageName,
                active: true,
                parameters: [],
                volumes: [],
                ports: []
            });
            $scope.imageName = '';
            $scope.imageIsActive = true;
        };

        $scope.removeImage = function (image) {
            $scope.service.images.splice($scope.service.images.indexOf(image), 1);
        };

        $scope.duplicateImage = function (image) {
            var newImage = angular.copy(image);
            delete newImage._id;
            delete newImage.created;
            newImage.name = newImage.name + '_copy';
            angular.forEach(newImage.volumes, function (volume, key) {
                delete volume._id;
            });
            angular.forEach(newImage.ports, function (port, key) {
                delete port._id;
            });
            angular.forEach(newImage.variables, function (variable, key) {
                delete variable._id;
            });
            $scope.service.images.push(newImage);
        };

        $scope.addParameter = function (image) {
            image.parameters.push($scope.parameter);
            $scope.parameter = {};
        };

        $scope.removeParameter = function (image, parameter) {
            image.parameters.splice(image.parameters.indexOf(parameter), 1);
        };

        $scope.addPort = function (image) {
            image.ports.push($scope.port);
            $scope.port = {'protocol': 'tcp'};
        };

        $scope.removePort = function (image, port) {
            image.ports.splice(image.ports.indexOf(port), 1);
        };

        $scope.addVariable = function (image) {
            image.variables.push($scope.variable);
            $scope.variable = {};
        };

        $scope.removeVariable = function (image, variable) {
            image.variables.splice(image.variables.indexOf(variable), 1);
        };

        $scope.addVolume = function (image) {
            image.volumes.push($scope.volume);
            $scope.volume = {};
        };

        $scope.removeVolume = function (image, volume) {
            image.volumes.splice(image.volumes.indexOf(volume), 1);
        };

        $scope.addCommand = function () {
            var d = new Date();
            var commandToAdd = {
                name: $scope.commandName,
                exec: $scope.commandExec,
                role: $scope.commandRole,
                fooRoleName: d.getMilliseconds()
            };
            $scope.service.commands.push(commandToAdd);
            $scope.commandName = '';
            $scope.commandExec = '';
            $scope.commandRole = 'user';
            $scope.downloadInProgress = false;
        };

        $scope.removeCommand = function (command) {
            $scope.service.commands.splice($scope.service.commands.indexOf(command), 1);
        };

        $scope.addJob = function () {
            var jobToAdd = {
                name: 'JobName',
                value: ':8080',
                type: 'url',
                interval: '* * * * *',
                active: false
            };
            $scope.service.jobs.push(jobToAdd);

            var service = $scope.service;
            service.$update(function (service) {
                $scope.service = service;
            }, function (err) {
                var title = 'Error - ' + moment().format('hh:mm:ss');
                Toasts.addToast(err, 'danger', title);
            });
        };

        $scope.removeJob = function (job) {
            $scope.service.jobs.splice($scope.service.jobs.indexOf(job), 1);
            $scope.update(false);
        };

        $scope.activationJob = function (job) {
            if (job.active) {
                $scope.activateJob(job);
            } else {
                $scope.desactivateJob(job);
            }
        };

        $scope.activateJob = function (job) {
            ServicesServices.activateJob($scope.service._id, job)
                .success(function (response) {
                    console.log('Success activation job');
                    Toasts.addToast('Success activation job', 'info');
                    $scope.update(false);
                }).error(function (err, status, headers, config) {
                    var title = 'Error - ' + moment().format('hh:mm:ss');
                    Toasts.addToast(err, 'danger', title);
                });
        };
        $scope.desactivateJob = function (job) {
            ServicesServices.desactivateJob($scope.service._id, job)
                .success(function (response) {
                    console.log('Success desactivation job');
                    Toasts.addToast('Success desactivation job', 'info');
                    $scope.update(false);
                }).error(function (err, status, headers, config) {
                    var title = 'Error - ' + moment().format('hh:mm:ss');
                    Toasts.addToast(err, 'danger', title);
                });
        };

        $scope.addUrl = function () {
            $scope.service.urls.push({
                label: $scope.urlLabel,
                url: $scope.urlUrl
            });
            $scope.urlLabel = '';
            $scope.urlUrl = '';
        };

        $scope.removeUrl = function (url) {
            $scope.service.urls.splice($scope.service.urls.indexOf(url), 1);
        };

        $scope.pullImage = function(image, daemon) {
            $scope.downloadInProgress = true;
            ServicesServices
                .pullImage($scope.service._id, image, daemon)
                .success(function (response) {
                    //Check the "waiting" case
                    if (response.length ===1 && response[0].status.indexOf('Waiting') > -1) {
                        Toasts.addToast(response[0].status, 'info');
                    } else {
                        Toasts.addToast('Download complete !', 'info');
                        $scope.findOne();
                    }
                    $scope.downloadInProgress = false;
                }).error(function (err, status, headers, config) {
                    var title = 'Error - ' + moment().format('hh:mm:ss');
                    var message = err.message ? err.message : err;
                    Toasts.addToast(message, 'danger', title);
                    $scope.downloadInProgress = false;
                });
        };

    }
]);
