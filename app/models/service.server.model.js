'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Image Schema, not useful outside Service
 */
var ImageSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name cannot be blank'
    },
    active: {
        type: Boolean,
        required: 'Active or not is required'
    }
})

/**
 * Service Schema
 */
var ServiceSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	images: [ImageSchema],
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Service', ServiceSchema);