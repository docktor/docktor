'use strict';

//Daemons service used for communicating with the daemons REST endpoints
angular.module('daemons').factory('Daemons', ['$resource',
	function($resource) {
		return $resource('daemons/:daemonId', {
			daemonId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);