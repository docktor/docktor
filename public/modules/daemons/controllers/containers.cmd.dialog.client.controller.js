'use strict';

angular.module('daemons').controller('ContainerCmdDialogController', ['$scope', '$mdDialog', 'title', 'results',
    function ($scope, $mdDialog, title, results) {
        $scope.title = title;
        $scope.results = results;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }
]);
