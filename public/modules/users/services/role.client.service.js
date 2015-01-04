'use strict';

angular.module('users').factory('RoleService', [
    function () {

        var adminRoles = ['admin'];
        var otherRoles = ['user'];

        return {
            validateRoleAdmin: function (currentUser) {
                return currentUser ? _.contains(adminRoles, currentUser.role) : false;
            },

            validateRoleOther: function (currentUser) {
                return currentUser ? _.contains(otherRoles, currentUser.role) : false;
            }
        };
    }
]);
