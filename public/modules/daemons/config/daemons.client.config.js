'use strict';

// Configuring the Daemons module
angular.module('daemons').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        /*Menus.addMenuItem('topbar', 'Daemons', 'daemons', 'dropdown', '/daemons(/create)?');
         Menus.addSubMenuItem('topbar', 'admin', 'List Daemons', 'daemons');
         Menus.addSubMenuItem('topbar', 'admin', 'New Daemon', 'daemons/create');*/
    }
]);
