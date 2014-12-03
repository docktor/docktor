'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Docker = require('dockerode'),
    Schema = mongoose.Schema;


/**
 * Variable Schema, not useful outside Image
 */
var VariableSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Variable Name cannot be blank'
    },
    value: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Parameter Schema, not useful outside Image
 */
var ParameterSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'parameter Name cannot be blank'
    },
    value: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Port Schema, not useful outside Image
 */
var PortSchema = new Schema({
    internal: {
        type: Number,
        trim: true,
        required: 'internal Port cannot be blank'
    },
    protocol: { // tcp / udp
        type: String,
        trim: true,
        default: 'tcp'
    },
    description: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Volume Schema, not useful outside Image
 */
var VolumeSchema = new Schema({
    internal: {
        type: String,
        trim: true,
        required: 'internal Volume cannot be blank'
    },
    value: { // default value. ex : /etc/localtime
        type: String,
        trim: true
    },
    rights: { // ro, or rw
        type: String,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    }
});

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
        required: 'Daemon Name cannot be blank'
    },
    protocol: {
        type: String,
        default: '',
        trim: true,
        required: 'Daemon Protocol cannot be blank'
    },
    host: {
        type: String,
        default: '',
        trim: true,
        required: 'Daemon Host cannot be blank'
    },
    port: {
        type: Number,
        default: '',
        trim: true,
        required: 'Daemon Port cannot be blank'
    },
    timedout: {
        type: Number,
        default: 5000,
        required: 'Daemon Timeout in ms'
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
    cadvisorApi: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    site: {
        type: Schema.ObjectId,
        ref: 'Site'
    },
    variables: [VariableSchema],
    ports: [PortSchema],
    volumes: [VolumeSchema],
    parameters: [ParameterSchema]
});

DaemonSchema.methods.getDaemonDocker = function () {
    return new Docker({
        protocol: this.protocol,
        host: this.host,
        port: this.port,
        timeout: this.timedout
    });
};

mongoose.model('Daemon', DaemonSchema);

