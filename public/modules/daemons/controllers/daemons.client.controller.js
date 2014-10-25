'use strict';

angular.module('daemons').controller('DaemonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Daemons',
	function($scope, $stateParams, $location, Authentication, Daemons) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var daemon = new Daemons({
				protocol: this.protocol,
				host: this.host,
				port: this.port,
				ca: this.ca,
				cert: this.cert,
				key: this.key,
				description: this.description
			});
			daemon.$save(function(response) {
				$location.path('daemons/' + response._id);

				$scope.protocol = '';
				$scope.host = '';
				$scope.port = '';
				$scope.ca = '';
				$scope.cert = '';
				$scope.key = '';
				$scope.description = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(daemon) {
			if (daemon) {
				daemon.$remove();

				for (var i in $scope.daemons) {
					if ($scope.daemons[i] === daemon) {
						$scope.daemons.splice(i, 1);
					}
				}
			} else {
				$scope.daemon.$remove(function() {
					$location.path('daemons');
				});
			}
		};

		$scope.update = function() {
			var daemon = $scope.daemon;

			daemon.$update(function() {
				$location.path('daemons/' + daemon._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.daemons = Daemons.query();
		};

		$scope.findOne = function() {
			$scope.daemon = Daemons.get({
				daemonId: $stateParams.daemonId
			});
		};
	}
]);