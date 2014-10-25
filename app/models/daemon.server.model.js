'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Daemon Schema
 */
var DaemonSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	url: {
		type: String,
		default: '',
		trim: true,
		required: 'Url cannot be blank'
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Daemon', DaemonSchema);