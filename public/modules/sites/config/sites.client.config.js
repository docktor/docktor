'use strict';

// Configuring the Sites module
angular.module('sites').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Sites', 'sites', 'dropdown', '/sites(/create)?');
        Menus.addSubMenuItem('topbar', 'sites', 'List Sites', 'sites');
        Menus.addSubMenuItem('topbar', 'sites', 'New Site', 'sites/create');
    }
]);
