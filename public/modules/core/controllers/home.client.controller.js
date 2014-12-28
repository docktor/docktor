'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdSidenav',
    function ($scope, Authentication, $mdSidenav) {
        $scope.authentication = Authentication;
        if ($scope.authentication.user) $mdSidenav('left').toggle();
    }
]);
