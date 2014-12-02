'use strict';

// Configuring the Services module
angular.module('services').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        //Menus.addMenuItem('topbar', 'Services', 'services', 'dropdown', '/services(/create)?');
        /*Menus.addSubMenuItem('topbar', 'services', 'List Services', 'services');
        Menus.addSubMenuItem('topbar', 'services', 'New Service', 'services/create');*/
    }
]);
