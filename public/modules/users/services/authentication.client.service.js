'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
    'RoleService',
    function (RoleService) {
        var _this = this;

        _this._data = {
            user: window.user,
            isAdmin: RoleService.validateRoleAdmin(window.user)
        };

        return _this._data;
    }
]);
