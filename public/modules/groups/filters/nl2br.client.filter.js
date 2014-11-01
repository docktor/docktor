'use strict';

angular.module('groups').filter('nl2br', [
	function() {
		return function(input) {
            if (input)
            return input.replace(/\n/g, '<br>');
		};
	}
]);