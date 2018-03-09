'use strict';

angular.module('core').directive('extraHostsDirective', [
    function () {
        return {
            templateUrl: '/modules/core/directives/views/directive-extrahosts.core.client.view.html',
            restrict: 'E',
            scope: {
                extraHosts: '=',
                withTitle: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.removeExtraHosts = function (extraHost) {
                    $scope.extraHosts.splice($scope.extraHosts.indexOf(extraHost), 1);
                };

                $scope.addExtraHost = function () {
                    var extraHost = {
                        'host': '',
                        'ip': ''
                    };
                    $scope.extraHosts.push(extraHost);
                };

            }],
            link: function postLink(scope, element, attrs) {
                // extraHosts directive directive logic
                // ...

                //element.text('this is the extraHostsDirective directive');
            }
        };
    }
]);
