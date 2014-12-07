'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Filesystem Schema, not useful outside Group
 */
var FilesystemSchema = new Schema({
    partition: {
        type: String,
        trim: true,
        required: 'Partition cannot be blank'
    },
    description: {
        type: String
    }
});

/**
 * Parameter Schema, not useful outside Image
 */
var ParameterContainerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Parameter Name cannot be blank'
    },
    value: {
        type: String,
        trim: true,
        required: 'Parameter Value cannot be blank'
    }
});

/**
 * Variable Schema, not useful outside Image
 */
var VariableContainerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Variable Name cannot be blank'
    },
    value: {
        type: String,
        trim: true,
        required: 'Variable Value cannot be blank'
    }
});

/**
 * Port Schema, not useful outside Image
 */
var PortContainerSchema = new Schema({
    internal: {
        type: Number,
        trim: true,
        required: 'internalPortContainer cannot be blank'
    },
    external: {
        type: Number,
        trim: true,
        required: 'externalPortContainer cannot be blank'
    },
    protocol: { // tcp / udp
        type: String,
        trim: true,
        default: 'tcp'
    }
});

/**
 * Volume Schema, not useful outside Image
 */
var VolumeContainerSchema = new Schema({
    internal: {
        type: String,
        trim: true,
        required: 'internalVolumeContainer cannot be blank'
    },
    external: {
        type: String,
        trim: true,
        required: 'externalVolumeContainer cannot be blank'
    },
    rights: { // ro, or rw
        type: String,
        trim: true
    }
});

/**
 * Container Schema, not useful outside Group
 */
var ContainerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Container Name cannot be blank'
    },
    hostname: {
        type: String,
        trim: true,
        required: 'Container Hostname cannot be blank'
    },
    image: {
        type: String,
        trim: true,
        required: 'Image cannot be blank'
    },
    serviceTitle: {
        type: String,
        trim: true
    },
    serviceId: {
        type: String,
        trim: true
    },
    containerId: {
        type: String,
        trim: true
    },
    parameters: [ParameterContainerSchema],
    ports: [PortContainerSchema],
    variables: [VariableContainerSchema],
    volumes: [VolumeContainerSchema],
    daemonId: { // TODO use Schema.ObjectId
        type: String,
        trim: true
    },
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
    contacts: {
        type: String,
        default: '',
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    portminrange: {
        type: Number
    },
    portmaxrange: {
        type: Number
    },
    daemon: { // default daemon
        type: Schema.ObjectId,
        ref: 'Daemon'
    },
    filesystems: [FilesystemSchema],
    containers: [ContainerSchema],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

GroupSchema.statics.resetContainerId = function (idGroup, idContainer) {
    var _this = this;
    var setToUpdate = {};
    setToUpdate['containers.$.containerId'] = null;
    _this.update({_id: idGroup, 'containers._id': idContainer},
        {$set: setToUpdate},
        function (err) {
            if (err) console.log('Erreur while updating container : ' + err);
        });
};

GroupSchema.statics.getUsedPorts = function (idGroup) {
    var _this = this;
    return _this.aggregate([
        {'$match': {_id: idGroup}},
        {'$unwind': '$containers'},
        {'$unwind': '$containers.ports'},
        {'$group': {_id: 0, 'usedPorts': {$addToSet: '$containers.ports.external'}}},
        {'$project': {_id: 0, usedPorts: 1}}
    ]);
};

mongoose.model('Group', GroupSchema);
