'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DaemonContainerSchema = new Schema({
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
    }
});

/**
 * Port Schema, not useful outside Image
 */
var PortContainerSchema = new Schema({
    internalPortContainer: {
        type: Number,
        trim: true,
        required: 'internalPortContainer cannot be blank'
    },
    externalPortContainer: {
        type: Number,
        trim: true,
        required: 'externalPortContainer cannot be blank'
    }
});

/**
 * Volume Schema, not useful outside Image
 */
var VolumeContainerSchema = new Schema({
    internalVolumeContainer: {
        type: String,
        trim: true,
        required: 'internalVolumeContainer cannot be blank'
    },
    externalVolumeContainer: {
        type: String,
        trim: true,
        required: 'externalVolumeContainer cannot be blank'
    }
});

/**
 * Container Schema, not useful outside Group
 */
var ContainerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name cannot be blank'
    },
    portsContainer: [PortContainerSchema],
    volumesContainer: [VolumeContainerSchema],
    daemonContainer: [DaemonContainerSchema],
    active: {
        type: Boolean,
        required: 'Active or not is required'
    }
});

/**
 * Group Schema
 */
var GroupSchema = new Schema({
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
	description: {
		type: String,
		default: '',
		trim: true
	},
    containers: [ContainerSchema],
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Group', GroupSchema);