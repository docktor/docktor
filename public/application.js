'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
    function ($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

angular.module(ApplicationConfiguration.applicationModuleName).run([
    '$rootScope', '$location', 'Authentication', 'RoleService', '_', '$templateCache',
    function ($rootScope, $location, Authentication, RoleService, _, $templateCache) {

        //$templateCache.put(TrNgGrid.cellHeaderTemplateId, '<div class="' + TrNgGrid.headerCellCssClass + '" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>' + '    <div class="' + TrNgGrid.columnTitleCssClass + '" ng-hide="(gridOptions.enableFiltering&&columnOptions.enableFiltering!==false)||columnOptions.enableFiltering">' + ' {{columnOptions.enableFiltering}}     {{columnTitle |' + TrNgGrid.translateFilter + ':gridOptions.locale}}' + '       <div ' + TrNgGrid.columnSortDirectiveAttribute + '=""></div>' + '    </div>' + '    <div ' + TrNgGrid.columnFilterDirectiveAttribute + '=""></div>' + '  </div>' + '</div>');
        //$templateCache.put(TrNgGrid.columnFilterTemplateId, '<div ng-show="(gridOptions.enableFiltering&&columnOptions.enableFiltering!==false)||columnOptions.enableFiltering" class="' + TrNgGrid.columnFilterCssClass + '">' + ' <div class="' + TrNgGrid.columnFilterInputWrapperCssClass + '"> <md-text-float label="{{columnTitle}}" class="tableDocktor" type="text" ng-model="columnOptions.filter" ng-keypress="speedUpAsyncDataRetrieval($event)"></md-text-float></div></div>');
        //$templateCache.put(TrNgGrid.footerGlobalFilterTemplateId, '<span ng-show="gridOptions.enableFiltering" class="pull-left form-group">' + '  <md-text-float label="search" class="input" type="text" ng-model="gridOptions.filterBy" ng-keypress="speedUpAsyncDataRetrieval($event)" ng-attr-placeholder="{{\'Search\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}"></md-text-float></span>');

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
