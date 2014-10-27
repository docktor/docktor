'use strict';

// Configuring the Daemons module
angular.module('daemons').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Daemons', 'daemons', 'dropdown', '/daemons(/create)?');
        Menus.addSubMenuItem('topbar', 'daemons', 'List Daemons', 'daemons');
        Menus.addSubMenuItem('topbar', 'daemons', 'New Daemon', 'daemons/create');
    }
]);