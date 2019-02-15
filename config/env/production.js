'use strict';

module.exports = {
    docktor_url: process.env.DOCKTOR_URL || 'https://docktor.cdk.corp.sopra',
    db: 'mongodb://db_1:27017/docktor',
    assets: {
        lib: {
            css: [
                'public/lib/angular-material/default-theme.css',
                'public/lib/angular-material/themes/green-theme.css',
                'public/lib/angular-material/themes/grey-theme.css',
                'public/lib/angular-material/angular-material.css',
                'public/lib/fontawesome/css/font-awesome.css',
                'public/lib/tr-ng-grid/trNgGrid.min.css',
                'public/lib/leaflet/dist/leaflet.css'
            ],
            js: [
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/angular/angular.js',
                'public/lib/angular-aria/angular-aria.js',
                'public/lib/hammerjs/hammer.js',
                'public/lib/angular-material/angular-material.js',
                'public/lib/angular-messages/angular-messages.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-messages/angular-messages.js',
                'public/lib/angular-touch/angular-touch.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/tr-ng-grid/trNgGrid.min.js',
                'public/lib/lodash/dist/lodash.underscore.min.js',
                'public/lib/moment/min/moment.min.js',
                'public/lib/leaflet/dist/leaflet.js',
                'public/lib/angular-leaflet-directive/dist/angular-leaflet-directive.min.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    },
    mailer: {
        from: process.env.MAILER_FROM || 'MAILER_FROM',
        options: {
            host: process.env.MAILER_HOST || 'MAILER_HOST',
            port: process.env.MAILER_PORT || 'MAILER_PORT',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
                pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
            }
        }
    }
};
