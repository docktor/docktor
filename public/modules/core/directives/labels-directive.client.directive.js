'use strict';

angular.module('core').directive('labelsDirective', [
    function () {
        return {
            templateUrl: '/modules/core/directives/views/directive-labels.core.client.view.html',
            restrict: 'E',
            scope: {
                labels: '=',
                withTitle: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.removeLabel = function (label) {
                    $scope.labels.splice($scope.labels.indexOf(label), 1);
                };

                $scope.addLabel = function () {
                    var label = {
                        'name': '',
                        'value': ''
                    };
                    $scope.labels.push(label);
                };

            }],
            link: function postLink(scope, element, attrs) {
                // labels directive directive logic
                // ...

                //element.text('this is the labelsDirective directive');
            }
        };
    }
]);
