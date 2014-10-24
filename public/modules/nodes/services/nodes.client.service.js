'use strict';

//Nodes service used for communicating with the nodes REST endpoints
angular.module('nodes').factory('Nodes', ['$resource',
	function($resource) {
		return $resource('nodes/:nodeId', {
			nodeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);