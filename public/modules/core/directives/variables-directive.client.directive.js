'use strict';

angular.module('core').directive('variablesDirective', [
    function () {
        return {
            templateUrl: '/modules/core/directives/views/directive-variables.core.client.view.html',
            restrict: 'E',
            scope: {
                variables: '=',
                withTitle: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.addVariable = function () {
                    var variable = {
                        'name': '',
                        'value': '',
                        'description': ''
                    };
                    $scope.variables.push(variable);
                };

                $scope.removeVariable = function (variable) {
                    $scope.variables.splice($scope.variables.indexOf(variable), 1);
                };
            }],
            link: function postLink(scope, element, attrs) {
                // Variables directive directive logic
                // ...

                //element.text('this is the variablesDirective directive');
            }
        };
    }
]);
