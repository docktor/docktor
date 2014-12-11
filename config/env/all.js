'use strict';

module.exports = {
    app: {
        title: 'Docktor',
        description: 'Docker Monitoring',
        keywords: 'Docker, Monitoring, Administration'
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'MEAN',
    sessionCollection: 'sessions',
    assets: {
        lib: {
            css: [
                'public/lib/fontawesome/css/font-awesome.css',
                'public/lib/angular-ui-select/dist/select.css',
                'public/lib/trNgGrid/release/trNgGrid.min.css',
                'public/lib/angular-material/angular-material.css'
            ],
            js: [
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/angular/angular.js',
                'public/lib/angular-aria/angular-aria.js',
                'public/lib/hammerjs/hammer.js',
                'public/lib/angular-material/angular-material.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-touch/angular-touch.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-ui-select/dist/select.js',
                'public/lib/trNgGrid/release/trNgGrid.min.js',
                'public/lib/raphael/raphael-min.js',
                'public/lib/justgage-toorshia/justgage.js',
                'public/lib/angular-justgage/ng-justgage.js',
                'public/lib/lodash/dist/lodash.underscore.min.js',
                'public/lib/moment/min/moment.min.js'
            ]
        },
        css: [
            'public/modules/**/css/*.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js'
        ],
        tests: [
            'public/lib/angular-mocks/angular-mocks.js',
            'public/modules/*/tests/*.js'
        ]
    }
};
