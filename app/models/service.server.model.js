'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
        trim: true,
        required: 'parameter defaultValue cannot be blank'
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
 * Command Schema, not useful outside Service
 */
var CommandSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Exec Name cannot be blank'
    },
    exec: {
        type: String,
        trim: true,
        required: 'exec command cannot be blank'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'admin'
    },
    created: {
        type: Date,
        default: Date.now
    }
});


/**
 * Shorcut Schema, not useful outside Service
 */
var UrlSchema = new Schema({
    label: {
        type: String,
        trim: true,
        required: 'Shortcut Name cannot be blank'
    },
    url: {
        type: String,
        trim: true,
        required: 'url cannot be blank'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

/**
 * Job Schema, not useful outside Service
 */
var JobSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Job Name cannot be blank'
    },
    value: {
        type: String,
        trim: true,
        required: 'Value of job (url or command) cannot be blank'
    },
    interval: {
        type: String,
        trim: true,
        required: 'Interval of job cannot be blank'
    },
    type: {
        type: String,
        enum: ['url', 'exec'],
        required: 'Type of job cannot be blank'
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    active: {
        type: Boolean,
        required: 'Active or not is required'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

/**
 * Image Schema, not useful outside Service
 */
var ImageSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Image Name cannot be blank'
    },
    created: {
        type: Date,
        default: Date.now
    },
    variables: [VariableSchema],
    ports: [PortSchema],
    volumes: [VolumeSchema],
    parameters: [ParameterSchema],
    active: {
        type: Boolean,
        required: 'Active or not is required'
    }
});

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
    commands: [CommandSchema],
    urls: [UrlSchema],
    jobs: [JobSchema],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

ServiceSchema.statics.getExec = function (serviceId, commandId) {
    var _this = this;
    return _this.aggregate(
        [
            {'$match': {_id: serviceId}},
            {'$unwind': '$commands'},
            {'$match': {'commands._id': new mongoose.Types.ObjectId(commandId)}},
            {'$project': {_id: 0, commands: 1}}
        ]);
};

ServiceSchema.statics.getAllJobs = function () {
    var _this = this;
    return _this.aggregate([
        {'$unwind': '$jobs'},
        {
            '$group': {
                '_id': 0, 'jobs': {
                    '$addToSet': {
                        'serviceId': '$_id',
                        'id': '$jobs._id',
                        'name': '$jobs.name',
                        'active': '$jobs.active',
                        'value': '$jobs.value',
                        'type': '$jobs.type'
                    }
                }
            }
        }
    ]);
};

ServiceSchema.statics.listSimplified = function () {
    var _this = this;
    return _this.aggregate(
        [{
            '$project': {
                '_id': 1,
                'title': 1,
                'insensitive': {'$toLower': '$title'}
            }
        }, {
            $sort: {'insensitive': 1}
        }]
    );
};

mongoose.model('Service', ServiceSchema);
