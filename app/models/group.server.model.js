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
    daemon: {
        type: Schema.ObjectId,
        ref: 'Daemon'
    },
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
    host: {
        type: String,
        trim: true
    },
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
 * Job Container Schema, not useful outside Image
 */
var JobContainerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name cannot be blank'
    },
    jobId: {
        type: String,
        trim: true,
        required: 'jobId cannot be blank'
    },
    description: {
        type: String,
        trim: true,
        required: 'description cannot be blank'
    },
    result: {
        type: String,
        trim: true,
        required: 'description cannot be blank'
    },
    status: {
        type: String,
        trim: true,
        required: 'Status cannot be blank'
    },
    lastExecution: {
        type: Date,
        default: Date.now
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
    jobs: [JobContainerSchema],
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
    },
    isSSO: {
        type: Boolean,
        required: 'Is project SSO or not',
        default: false,
    }
});

GroupSchema.statics.resetContainerId = function (idGroup, idContainer) {
    var _this = this;
    var setToUpdate = {};
    setToUpdate['containers.$.containerId'] = null;
    _this.update({ _id: idGroup, 'containers._id': idContainer },
        { $set: setToUpdate },
        function (err) {
            if (err) console.log('Erreur while updating container : ' + err);
        });
};

GroupSchema.statics.getUsedPorts = function (idGroup) {
    var _this = this;
    return _this.aggregate([
        { '$match': { _id: idGroup } },
        { '$unwind': '$containers' },
        { '$unwind': '$containers.ports' },
        { '$group': { _id: 0, 'usedPorts': { $addToSet: '$containers.ports.external' } } },
        { '$project': { _id: 0, usedPorts: 1 } }
    ]);
};

GroupSchema.statics.getJobs = function () {
    var _this = this;
    return _this.aggregate([
        { '$unwind': '$containers' },
        { '$unwind': '$containers.jobs' },
        {
            '$group': {
                _id: {
                    'groupId': '$_id',
                    'groupTitle': '$title',
                    'serviceId': '$containers.serviceId',
                    'containerId': '$containers._id',
                    'name': '$containers.name',
                    'hostname': '$containers.hostname'
                },
                'jobs': { $push: '$containers.jobs' }
            }
        }
    ]);
};

GroupSchema.statics.getGroupsOfOneDaemon = function (idDaemon) {
    var _this = this;
    /*
     Example of result :

     {"_id" : 0,
     "groupIds" : [
     ObjectId("546b185246be610000ce23b2"),
     ObjectId("547a0556420ed600007a8ee7"),
     ObjectId("547cb1466e48a67131045b1c")
     ],
     "daemonIds" : [
     "544be91dc65afab7965c9bac"
     ]}
     */
    return _this.aggregate([
        { '$unwind': '$containers' },
        { '$group': { '_id': 0, 'groupIds': { '$addToSet': '$_id' }, 'daemonIds': { '$addToSet': '$containers.daemonId' } } },
        { '$match': { 'daemonIds': { '$in': [idDaemon] } } }
    ]);
};

GroupSchema.statics.getGroupsOfOneService = function (idService) {
    var _this = this;
    /*
     Example of result :
     {
     "_id" : 0,
     "groups" : [ {
     "id" : ObjectId("546b185246be610000ce23b2"),
     "title" : "GroupCCCD"
     }]
     }
     */
    return _this.aggregate([
        { '$unwind': '$containers' },
        { '$match': { 'containers.serviceId': { '$in': [idService] } } },
        { '$group': { '_id': 0, 'groups': { '$addToSet': { 'id': '$_id', 'title': '$title' } } } }
    ]);
};

GroupSchema.statics.getContainersOfOneService = function (idService) {
    var _this = this;

    return _this.aggregate([
        { '$unwind': '$containers' },
        { '$match': { 'containers.serviceId': { '$in': [idService] } } },
        {
            '$group': {
                '_id': 0,
                'containers': {
                    '$addToSet': {
                        'id': '$containers._id',
                        'groupId': '$_id',
                        'title': '$containers.hostname'
                    }
                }
            }
        }
    ]);
};

GroupSchema.statics.insertJob = function (groupId, containerId, job) {
    var _this = this;
    _this.update(
        { '_id': groupId, 'containers._id': containerId },
        {
            '$push': {
                'containers.$.jobs': {
                    '$each': [job],
                    '$sort': { 'lastExecution': 1 },
                    '$slice': -10
                }
            }
        },
        function (err) {
            if (err) console.log('Erreur while updating container : ' + err);
        }
    );
};

GroupSchema.statics.listSimplified = function () {
    var _this = this;
    return _this.aggregate(
        [{
            '$project': {
                '_id': 1,
                'title': 1,
                'description': 1,
                'portminrange': 1,
                'portmaxrange': 1,
                'insensitive': { '$toLower': '$title' }
            }
        }, {
            $sort: { 'insensitive': 1 }
        }]
    );
};

mongoose.model('Group', GroupSchema);
