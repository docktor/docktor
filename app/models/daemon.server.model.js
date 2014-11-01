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
    name: {
        type: String,
        default: '',
        trim: true,
        required: 'Name cannot be blank'
    },
    protocol: {
		type: String,
		default: '',
		trim: true,
		required: 'Protocol cannot be blank'
	},
    host: {
        type: String,
        default: '',
        trim: true,
        required: 'Host cannot be blank'
    },
    port: {
        type: Number,
        default: '',
        trim: true,
        required: 'Port cannot be blank'
    },
    ca: {
        type: String,
        default: '',
        trim: true
    },
    cert: {
        type: String,
        default: '',
        trim: true
    },
    key: {
        type: String,
        default: '',
        trim: true
    },
    volume: { // directory witch contains data of services for each groups
        type: String,
        default: '',
        trim: true
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