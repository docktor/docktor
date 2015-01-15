'use strict';

var config = require('./config'),
    Agenda = require('agenda'),
    request = require('request'),
    _ = require('lodash');

var collectionAgenda = 'agendaJobs';

var agenda = new Agenda({
    db: {
        address: config.db,
        collection: collectionAgenda
    }
});
module.exports = agenda;

module.exports.scheduleJob = function (job) {
    agenda.every(job.interval, job.jobId, job);
};

module.exports.defineJob = function (jobName) {
    var mongoose = require('mongoose'), Group = mongoose.model('Group'), Daemon = mongoose.model('Daemon');

    agenda.define(jobName, function (jobSchedule) {
        _.forEach(jobSchedule.attrs.data.containers, function (container) {
            var containerId = container.containerId;
            Group.findById(container.groupId).populate('daemon').exec(function (err, group) {
                if (err) console.log(err);
                var containerFound = group.containers.id(containerId);
                if (!containerFound) {
                    console.log('Failed to load container ' + containerId);
                } else {
                    Daemon.findById(containerFound.daemonId).exec(function (err, daemon) {
                        if (err) {
                            console.log('ERR');
                            containerFound(err);
                        }
                        if (!daemon) {
                            console.log('Failed to load daemon');
                        }
                        containerFound.daemon = daemon;
                        var daemonDocker = daemon.getDaemonDocker();

                        var dockerContainer = daemonDocker.getContainer(containerFound.containerId);

                        dockerContainer.inspect(function (err, info) {
                            if (err || (info.State && (info.State.Running === false || info.State.Paused === true))) {
                                var job = {
                                    'jobId': jobSchedule.attrs.data.jobId,
                                    'name': jobSchedule.attrs.data.name,
                                    'description': 'Check container status',
                                    'result': err,
                                    'status': 'warning',
                                    'lastExecution': Date.now
                                };
                                if (err) {
                                    job.result = err;
                                } else if (info.State) {
                                    job.result = 'Container state Running:' + info.State.Running + ' Paused:' + info.State.Paused;
                                } else {
                                    job.result = 'Result Unknown';
                                }

                                Group.insertJob(group._id, containerFound._id, job);
                            } else {
                                if (jobSchedule.attrs.data.type === 'url') {
                                    agenda.jobCheckUrl(jobSchedule, group, containerFound);
                                } else {
                                    agenda.jobDockerExec(jobSchedule, group, containerFound, dockerContainer);
                                }
                            }
                        });
                    });
                }
            });
        });
    });
};

module.exports.defineAll = function () {
    console.log('Scheduler defineAll');

    var mongoose = require('mongoose'),
        Service = mongoose.model('Service'),
        Group = mongoose.model('Group');

    Service.getAllJobs().exec(function (err, data) {
        if (err) {
            console.log('ERROR :');
            console.log(err);
        } else {
            if (data[0]) {
                data[0].jobs.forEach(function (job) {
                    if (job.active === true) {
                        agenda.defineJob(job.id);
                    } else {
                        console.log('Job ' + job.id + ' active false');
                    }
                });
            }
        }
    });
};

module.exports.jobCheckUrl = function (jobSchedule, group, container) {
    var mongoose = require('mongoose'), Group = mongoose.model('Group');
    var url = agenda.computeUrl(jobSchedule.attrs.data.value, container);
    request(url, function (err, resp) {
        var job = {
            'jobId': jobSchedule.attrs.data.jobId,
            'name': jobSchedule.attrs.data.name,
            'description': 'Check status 200 on ' + url,
            'result': '',
            'lastExecution': Date.now
        };
        if (resp && resp.statusCode === 200) {
            job.status = 'success';
            job.result = 'HTTP status code received : ' + resp.statusCode;
        } else {
            job.status = 'error';
            if (resp) {
                job.result = 'StatusCode : ' + resp.statusCode;
            } else {
                job.result = 'url unreachable : ' + url;
            }
        }
        Group.insertJob(group._id, container._id, job);
    });
};

module.exports.computeUrl = function (jobValue, container) {
    if (jobValue.substr(0, 1) === ':') {
        var urlWithoutPort = '';
        var portInContainer = jobValue.substr(1, jobValue.length);
        var pos = jobValue.indexOf('/');
        if (pos > 0) {
            portInContainer = jobValue.substr(1, pos);
            urlWithoutPort = jobValue.substr(pos, jobValue.length);
            if (!urlWithoutPort) urlWithoutPort = '';
        }
        var portMapping = _.where(container.ports, {'internal': parseInt(portInContainer)});
        var portExternal = '';
        if (portMapping && portMapping.length > 0) portExternal = ':' + portMapping[0].external;

        if (!container.daemon) {
            return jobValue + ' no daemon found';
        } else {
            return 'http://' + container.daemon.host + portExternal + urlWithoutPort;
        }
    }
    return jobValue;
};

module.exports.jobDockerExec = function (jobSchedule, group, container, dockerContainer) {
    var mongoose = require('mongoose'), Group = mongoose.model('Group');

    var jobValue = jobSchedule.attrs.data.value;

    var command = jobValue.split(' ');
    var options = {
        'AttachStdout': true,
        'AttachStderr': true,
        'Tty': false,
        Cmd: command
    };

    dockerContainer.exec(options, function (err, exec) {
        console.log('Exec in dockerContainer');
        var job = {
            'jobId': jobSchedule.attrs.data.jobId,
            'name': jobSchedule.attrs.data.name,
            'description': 'Exec ' + jobValue,
            'result': '',
            'lastExecution': Date.now
        };

        if (err) {
            job.status = 'error';
            job.result = err;
            Group.insertJob(group._id, container._id, job);
            console.log('ERROR');
            console.log(err);
            return;
        }

        exec.start(function (err, stream) {
            if (err) {
                job.status = 'err';
                job.result = err;
                Group.insertJob(group._id, container._id, job);
                console.log('ERROR');
                console.log(err);
                return;
            }

            var string = [];
            stream.on('data', function (buffer) {
                console.log('Receive buffer');
                console.log(buffer);
                var part = buffer;
                string.push(part.toString());
            });
            stream.on('end', function () {
                job.status = 'success';
                job.result = 'TODO';
                Group.insertJob(group._id, container._id, job);
            });
        });
    });

};

module.exports.activateJob = function (job, serviceId, cbSuccess, cbError) {
    var mongoose = require('mongoose'), Group = mongoose.model('Group');

    Group.getContainersOfOneService(serviceId.toString()).exec(function (err, data) {
        if (err) {
            cbError(err);
        } else {
            var dataJob = {};
            if (data && data[0] && data[0].containers.length > 0) {
                dataJob.type = job.type;
                dataJob.value = job.value;
                dataJob.jobId = job._id;
                dataJob.name = job.name;
                dataJob.containers = [];
                dataJob.interval = job.interval;
                dataJob.serviceId = serviceId.toString();
                data[0].containers.forEach(function (container) {
                    dataJob.containers.push({
                        'groupId': container.groupId,
                        'containerId': container.id
                    });
                });
            }

            if (!_.isEmpty(dataJob)) {
                agenda.defineJob(job._id);
                agenda.scheduleJob(dataJob);
            } else {
                console.log('no deployed container, no schedule');
            }
        }
    });
};

module.exports.desactivateJob = function (jobId, cb) {
    agenda.cancel({name: jobId}, function (err, numRemoved) {
        if (err) console.log(err);
        if (cb) cb(numRemoved);
    });
};

/**
 * Desactivate then activate all jobs attached to a service
 * @param serviceId
 */
module.exports.reactivateJobsOnService = function (serviceId) {
    var mongoose = require('mongoose'), Group = mongoose.model('Group');

    var requestJobs = function (err, collection) {
        collection.find({'data.serviceId': serviceId}).toArray(function (err, jobs) {

            if (err) {
                console.log('ERR reactivateJobsOnService');
                console.log(err);
            }

            _.forEach(jobs, function (job) {
                agenda.desactivateJob(job.data.jobId);

                // activate job
                Group.getContainersOfOneService(serviceId.toString()).exec(function (err, data) {
                    if (err) {
                        console.log('ERR');
                        console.log(err);
                    } else {
                        var dataJob = job.data;
                        dataJob.containers = [];
                        if (data && data[0] && data[0].containers.length > 0) {
                            data[0].containers.forEach(function (container) {
                                dataJob.containers.push({
                                    'groupId': container.groupId,
                                    'containerId': container.id
                                });
                            });
                        }

                        if (!_.isEmpty(dataJob)) {
                            agenda.defineJob(dataJob.jobId);
                            agenda.scheduleJob(dataJob);
                        } else {
                            console.log('no deployed container, no schedule');
                        }
                    }
                });
            });
        });
    };
    mongoose.connection.db.collection(collectionAgenda, requestJobs);

};
