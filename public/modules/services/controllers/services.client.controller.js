'use strict';

angular.module('services').controller('ServicesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Services',
	function($scope, $stateParams, $location, Authentication, Services) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var service = new Services({
				title: this.title,
				content: this.content
			});
			service.$save(function(response) {
				$location.path('services/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(service) {
			if (service) {
				service.$remove();

				for (var i in $scope.services) {
					if ($scope.services[i] === service) {
						$scope.services.splice(i, 1);
					}
				}
			} else {
				$scope.service.$remove(function() {
					$location.path('services');
				});
			}
		};

		$scope.update = function() {
			var service = $scope.service;

			service.$update(function() {
				$location.path('services/' + service._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.services = Services.query();
		};

		$scope.findOne = function() {
			$scope.service = Services.get({
				serviceId: $stateParams.serviceId
			});
		};


        $scope.removeImage = function(imgId) {
            console.log('remove image: ' + imgId);
            for (var i = 0; i < $scope.service.images.length; i++) {
                if ($scope.service.images[i]._id === imgId) {
                    $scope.service.images.splice(i, 1);
                }
            }
        };

        $scope.addImage = function(isValid){
            console.log('add image: ' + $scope.imageName);
            if (isValid) {
                $scope.service.images.push({
                    name: $scope.imageName,
                    active: $scope.imageIsActive
                });
            }
            $scope.imageName = '';
            $scope.imageIsActive = '';
        };

    }
]);