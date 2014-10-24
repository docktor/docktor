'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Node Schema
 */
var NodeSchema = new Schema({
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

mongoose.model('Node', NodeSchema);