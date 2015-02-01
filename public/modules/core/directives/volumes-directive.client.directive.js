'use strict';

angular.module('core').directive('volumesDirective', [
    function () {
        return {
            templateUrl: '/modules/core/directives/views/directive-volumes.core.client.view.html',
            restrict: 'E',
            scope: {
                volumes: '=',
                displayExternalVolume: '=',
                withTitle: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.removeVolume = function (volume) {
                    $scope.volumes.splice($scope.volumes.indexOf(volume), 1);
                };

                $scope.addVolume = function () {
                    var volume = {
                        'internal': '',
                        'description': ''
                    };

                    if ($scope.displayExternalVolume) {
                        volume['external'] = '';
                    } else {
                        volume['value'] = '';
                    }
                    $scope.volumes.push(volume);
                };

            }],
            link: function postLink(scope, element, attrs) {
                // Volumes directive directive logic
                // ...

                //element.text('this is the volumesDirective directive');
            }
        };
    }
]);
