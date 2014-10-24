'use strict';

// Setting up route
angular.module('nodes').config(['$stateProvider',
	function($stateProvider) {
		// Nodes state routing
		$stateProvider.
		state('listNodes', {
			url: '/nodes',
			templateUrl: 'modules/nodes/views/list-nodes.client.view.html'
		}).
		state('createNode', {
			url: '/nodes/create',
			templateUrl: 'modules/nodes/views/create-node.client.view.html'
		}).
		state('viewNode', {
			url: '/nodes/:nodeId',
			templateUrl: 'modules/nodes/views/view-node.client.view.html'
		}).
		state('editNode', {
			url: '/nodes/:nodeId/edit',
			templateUrl: 'modules/nodes/views/edit-node.client.view.html'
		});
	}
]);