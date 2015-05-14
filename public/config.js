'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
    // Init module configuration options
    var applicationModuleName = 'docktor';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngMessages', 'ngSanitize',
        'ui.router', 'ui.utils', 'leaflet-directive', 'btford.socket-io', 'chart.js', 'angularMoment'];

    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();
