'use strict';

(function () {
    describe('HeaderController', function () {
        //Initialize global variables
        var scope,
            HeaderController;

        // Define favorites for user global variable
        window.user = {
            favorites: []
        };

        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName));

        beforeEach(inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();

            HeaderController = $controller('HeaderController', {
                $scope: scope
            });
        }));

        it('should expose the authentication service', function () {
            expect(scope.authentication).toBeTruthy();
        });
    });
})();
