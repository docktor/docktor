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
    cluster : false,
    assets: {
        lib: {
            css: [
                'public/lib/semantic-ui/dist/semantic.min.css',
                'public/lib/fontawesome/css/font-awesome.css',
                'public/lib/leaflet/dist/leaflet.css',
                'public/lib/angular-chart.js/dist/angular-chart.css'
            ],
            js: [
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/semantic-ui/dist/semantic.min.js',
                'public/lib/angular/angular.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-aria/angular-aria.js',
                'public/lib/hammerjs/hammer.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.js',
                'public/lib/angular-messages/angular-messages.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/lodash/dist/lodash.underscore.min.js',
                'public/lib/moment/min/moment.min.js',
                'public/lib/leaflet/dist/leaflet.js',
                'public/lib/angular-leaflet-directive/dist/angular-leaflet-directive.min.js',
                'public/lib/socket.io-client/socket.io.js',
                'public/lib/angular-socket-io/socket.min.js',
                'public/lib/Chart.js/Chart.min.js',
                'public/lib/angular-chart.js/dist/angular-chart.min.js'

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
