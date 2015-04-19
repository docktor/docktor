'use strict';

angular.module('core').directive('portsDirective', [
    function () {
        return {
            templateUrl: '/modules/core/directives/views/directive-ports.core.client.view.html',
            restrict: 'E',
            scope: {
                ports: '=',
                displayExternalPort: '=',
                withTitle: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.addPort = function () {
                    var newPort = {
                        'internal': '',
                        'protocol': 'tcp',
                        'description': ''
                    };

                    if ($scope.displayExternalPort) {
                        newPort.external = '';
                    }
                    $scope.ports.push(newPort);
                };

                $scope.removePort = function (port) {
                    $scope.ports.splice($scope.ports.indexOf(port), 1);
                };
            }],
            link: function postLink(scope, element, attrs) {
                // Ports directive directive logic
                // ...

                //element.text('this is the portsDirective directive');
            }
        };
    }
]);
