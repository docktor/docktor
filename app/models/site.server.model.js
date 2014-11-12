'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Site Schema
 */
var SiteSchema = new Schema({
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
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    }
});

mongoose.model('Site', SiteSchema);
