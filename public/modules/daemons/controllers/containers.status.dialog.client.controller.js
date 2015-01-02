'use strict';

angular.module('daemons').controller('ContainerStatusDialogController', ['$scope', '$mdDialog', 'currentContainer',
    function ($scope, $mdDialog, currentContainer) {
        $scope.currentContainer = currentContainer;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }
]);
