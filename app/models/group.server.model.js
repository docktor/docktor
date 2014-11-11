'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Variable Schema, not useful outside Image
 */
var VariableContainerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name cannot be blank'
    },
    value: {
        type: String,
        trim: true,
        required: 'Value cannot be blank'
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
    hostname: {
        type: String,
        trim: true,
        required: 'Hostname cannot be blank'
    },
    image: {
        type: String,
        trim: true,
        required: 'Image cannot be blank'
    },
    containerId: {
        type: String,
        trim: true
    },
    ports: [PortContainerSchema],
    variables: [VariableContainerSchema],
    volumes: [VolumeContainerSchema],
    daemonId: {
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

mongoose.model('Group', GroupSchema);
