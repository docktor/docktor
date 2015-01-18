'use strict';

angular.module('core').factory('Version', ['$http',
    function ($http) {
        return {
            getInfo: function () {
                return $http.get('/version/info');
            }
        };
    }
]);
