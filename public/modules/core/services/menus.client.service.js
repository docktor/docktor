'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', ['Authentication',

    function (Authentication) {
        // Define a set of default roles
        this.defaultRoles = ['*'];

        // Define the menus object
        this.menus = {};

        // A private function for rendering decision
        var shouldRender = function (user) {
            if (user) {
                if (!!~this.roles.indexOf('*')) {
                    return true;
                } else {
                    for (var roleIndex in this.roles) {
                        if (this.roles[roleIndex] === user.role) {
                            return true;
                        }
                    }
                }
            } else {
                return this.isPublic;
            }

            return false;
        };

        // Validate menu existance
        this.validateMenuExistance = function (menuId) {
            if (menuId && menuId.length) {
                if (this.menus[menuId]) {
                    return true;
                } else {
                    throw new Error('Menu does not exists');
                }
            } else {
                throw new Error('MenuId was not provided');
            }
        };

        // Get the menu object by menu id
        this.getMenu = function (menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            return this.menus[menuId];
        };

        // Add new menu object by menu id
        this.addMenu = function (menuId, isPublic, roles) {
            // Create the new menu
            this.menus[menuId] = {
                isPublic: isPublic || false,
                roles: roles || this.defaultRoles,
                items: [],
                shouldRender: shouldRender
            };

            // Return the menu object
            return this.menus[menuId];
        };

        // Add menu item object
        this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position, icon) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Push new menu item
            this.menus[menuId].items.push({
                title: menuItemTitle,
                link: menuItemURL,
                menuItemType: menuItemType || 'item',
                menuItemClass: menuItemType,
                uiRoute: menuItemUIRoute || ('/' + menuItemURL),
                isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
                roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
                position: position || 0,
                items: [],
                shouldRender: shouldRender,
                icon: icon
            });
            // Return the menu object
            return this.menus[menuId];
        };

        // Add submenu item object
        this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
                    // Push new submenu item
                    this.menus[menuId].items[itemIndex].items.push({
                        title: menuItemTitle,
                        link: menuItemURL,
                        uiRoute: menuItemUIRoute || ('/' + menuItemURL),
                        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
                        roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
                        position: position || 0,
                        shouldRender: shouldRender,
                        isFavorite: (menuItemURL.indexOf('groups/') === 0)
                    });
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing favorites object by menu id
        this.removeAllFavorites = function (menuId) {
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                this.menus[menuId].items[itemIndex].items = _.filter(this.menus[menuId].items[itemIndex].items, {'isFavorite': false});
            }

            // Return the menu object
            return this.menus[menuId];
        };

        /**
         * Refresh favorites (groups) on menu, order by title.
         */
        this.refreshFavorites = function () {
            var menuId = 'topbar';
            var _this = this;
            this.validateMenuExistance(menuId);
            this.removeAllFavorites(menuId);
            _.sortBy(Authentication.user.favorites, 'title').forEach(function (group) {
                _this.addSubMenuItem(menuId, 'groups', group.title, 'groups/' + group._id);
            });
            return this.menus[menuId];
        };

        //Adding the topbar menu
        this.addMenu('topbar');
    }
]);
