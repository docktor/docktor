'use strict';

module.exports = {
	docktor_url: process.env.DOCKTOR_URL || 'http://localhost:3000',
	db: 'mongodb://localhost/docktor-dev',
	app: {
		title: 'Docktor - Development Environment'
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
