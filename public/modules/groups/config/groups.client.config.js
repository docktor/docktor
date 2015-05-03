'use strict';

// Configuring the Groups module
angular.module('groups').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', 'My Groups', 'groups', 'dropdown', '/groups/?', null , null , null , 'cubes');
        Menus.addSubMenuItem('topbar', 'groups', 'All Groups', 'groups');
        Menus.refreshFavorites();
    }
]);
