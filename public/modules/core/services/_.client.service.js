'use strict';

// Wrapper of Lo-Dash
angular.module('core').factory('_', [
    function () {
        return window._; //Lodash must already be loaded on the page
    }
]);
