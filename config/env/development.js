'use strict';

module.exports = {
	db: 'mongodb://localhost/docktor-dev',
	app: {
		title: 'Docktor - Development Environment'
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
