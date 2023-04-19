require('dotenv').config();

module.exports = {
	development: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		ENDPOINT_ID: process.env.DB_ENDPOINT,
		dialect: 'postgres',
		dialectOptions: {
			useUTC: false,
		},
		timezone: '+07:00',
	},
	test: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: 'postgres',
		dialectOptions: {
			useUTC: false,
		},
		timezone: '+07:00',
	},
	production: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: 'postgres',
		dialectOptions: {
			useUTC: false,
		},
		timezone: '+07:00',
	},
};
