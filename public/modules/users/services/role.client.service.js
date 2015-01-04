'use strict';

angular.module('users').factory('RoleService', [
    function () {

        var adminRoles = ['admin'];
        var otherRoles = ['user'];

        return {
            validateRoleAdmin: function (currentUser) {
                console.log('validateRoleAdmin');
                console.log(_.contains(adminRoles, currentUser.role));
                return currentUser ? _.contains(adminRoles, currentUser.role) : false;
            },

            validateRoleOther: function (currentUser) {
                return currentUser ? _.contains(otherRoles, currentUser.role) : false;
            }
        };
    }
]);
