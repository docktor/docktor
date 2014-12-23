'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
    function ($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);

angular.module(ApplicationConfiguration.applicationModuleName)
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryColor('green')
            .accentColor('teal');
    });


//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
    TrNgGrid.tableCssClass = "tr-ng-grid table table-hover";

});

angular.module(ApplicationConfiguration.applicationModuleName).run([
    '$rootScope', '$location', 'Authentication', 'RoleService', '_',
    function ($rootScope, $location, Authentication, RoleService, _) {

        var routesForAdmin = ['/admin'];

        // check if current location matches route
        var routeAdmin = function (route) {
            return _.find(routesForAdmin,
                function (noAuthRoute) {
                    return route.slice(0, noAuthRoute.length) === noAuthRoute;
                    // TODO with Lo-Dash 3.0.0 return _.startsWith(route, noAuthRoute);
                });
        };

        $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {
            if (routeAdmin($location.url()) && !RoleService.validateRoleAdmin(Authentication.user)) {
                // redirect back to login
                ev.preventDefault();
                alert('ERROR. A non admin role with a admin path');
                $location.path('/error');
            }
        });
    }]);
