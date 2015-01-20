'use strict';

angular.module('core').controller('FooterController', ['$scope', 'Version',
    function ($scope, Version) {
        Version.getInfo().success(
            function (response) {
                $scope.info = response;
            }
        );
    }
]);
