'use strict';

// Configuring the Sites module
angular.module('sites').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', 'Admin', 'admin', 'dropdown', '/admin(.*)?', null, ['admin']);
        Menus.addSubMenuItem('topbar', 'admin', 'New Group', 'admin/groups/create');
        Menus.addSubMenuItem('topbar', 'admin', 'Daemons', 'admin/daemons');
        Menus.addSubMenuItem('topbar', 'admin', 'Jobs', 'admin/jobs/overview');
        Menus.addSubMenuItem('topbar', 'admin', 'Services', 'admin/services');
        Menus.addSubMenuItem('topbar', 'admin', 'Sites', 'admin/sites');
        Menus.addSubMenuItem('topbar', 'admin', 'Users', 'admin/users');
    }
]);
