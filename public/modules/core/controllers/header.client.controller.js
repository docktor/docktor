'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$mdSidenav',
    function ($scope, Authentication, Menus, $mdSidenav) {
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function (side) {
            $mdSidenav(side).toggle();
        };

        $scope.close = function(side) {
            $mdSidenav(side).close();
        };
    }
]);
