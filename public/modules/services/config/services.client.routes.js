'use strict';

// Setting up route
angular.module('services').config(['$stateProvider',
	function($stateProvider) {
		// Services state routing
		$stateProvider.
		state('listServices', {
			url: '/services',
			templateUrl: 'modules/services/views/list-services.client.view.html'
		}).
		state('createService', {
			url: '/services/create',
			templateUrl: 'modules/services/views/create-service.client.view.html'
		}).
		state('viewService', {
			url: '/services/:serviceId',
			templateUrl: 'modules/services/views/view-service.client.view.html'
		}).
		state('editService', {
			url: '/services/:serviceId/edit',
			templateUrl: 'modules/services/views/edit-service.client.view.html'
		});
	}
]);