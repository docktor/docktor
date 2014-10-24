'use strict';

// Configuring the Nodes module
angular.module('nodes').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Nodes', 'nodes', 'dropdown', '/nodes(/create)?');
		Menus.addSubMenuItem('topbar', 'nodes', 'List Nodes', 'nodes');
		Menus.addSubMenuItem('topbar', 'nodes', 'New Node', 'nodes/create');
	}
]);