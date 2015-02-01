'use strict';

angular.module('core').directive('parametersDirective', [
    function () {
        return {
            templateUrl: '/modules/core/directives/views/directive-parameters.core.client.view.html',
            restrict: 'E',
            scope: {
                parameters: '=',
                withTitle: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.addParameter = function () {
                    var parameter = {
                        'name': '',
                        'value': '',
                        'description': ''
                    };
                    $scope.parameters.push(parameter);
                };

                $scope.removeParameter = function (parameter) {
                    $scope.parameters.splice($scope.parameters.indexOf(parameter), 1);
                };
            }],
            link: ['$scope', 'element', 'attrs', function postLink($scope, element, attrs) {

                //$scope.displayFormParameter = false;

                // Parameters directive directive logic
                // ...

                //element.text('this is the parametersDirective directive');
            }]
        };
    }
]);
