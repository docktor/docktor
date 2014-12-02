'use strict';

// Configuring the Groups module
angular.module('groups').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', 'Groups', 'groups', 'dropdown', '/groups/?');
        Menus.addSubMenuItem('topbar', 'groups', 'List Groups', 'groups');
    }
]);
