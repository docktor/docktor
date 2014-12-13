'use strict';

module.exports = {
	db: 'mongodb://db_1:27017/docktor',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/fontawesome/css/font-awesome.min.css',
				'public/lib/angular-ui-select/dist/select.min.css',
				'public/lib/trNgGrid/release/trNgGrid.min.css',
				'public/lib/bootstrap-material-design/dist/css/material.min.css',
				'public/lib/bootstrap-material-design/dist/css/material-wfont.min.css',
				'public/lib/bootstrap-material-design/dist/css/ripples.min.css'
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-cookies/angular-cookies.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-touch/angular-touch.min.js',
				'public/lib/angular-sanitize/angular-sanitize.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/angular-ui-select/dist/select.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/trNgGrid/release/trNgGrid.min.js',
				'public/lib/raphael/raphael-min.js',
				'public/lib/justgage-toorshia/justgage.js',
				'public/lib/angular-justgage/ng-justgage.js',
				'public/lib/lodash/dist/lodash.underscore.min.js',
				'public/lib/moment/min/moment.min.js',
				'public/lib/bootstrap-material-design/dist/js/material.min.js',
				'public/lib/bootstrap-material-design/dist/js/ripples.min.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
