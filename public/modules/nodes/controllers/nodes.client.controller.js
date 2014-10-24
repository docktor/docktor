'use strict';

angular.module('nodes').controller('NodesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Nodes',
	function($scope, $stateParams, $location, Authentication, Nodes) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var node = new Nodes({
				url: this.url,
				description: this.description
			});
			node.$save(function(response) {
				$location.path('nodes/' + response._id);

				$scope.url = '';
				$scope.description = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(node) {
			if (node) {
				node.$remove();

				for (var i in $scope.nodes) {
					if ($scope.nodes[i] === node) {
						$scope.nodes.splice(i, 1);
					}
				}
			} else {
				$scope.node.$remove(function() {
					$location.path('nodes');
				});
			}
		};

		$scope.update = function() {
			var node = $scope.node;

			node.$update(function() {
				$location.path('nodes/' + node._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.nodes = Nodes.query();
		};

		$scope.findOne = function() {
			$scope.node = Nodes.get({
				nodeId: $stateParams.nodeId
			});
		};
	}
]);