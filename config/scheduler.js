'use strict';

var config = require('./config'),
    Agenda = require('agenda');

var agenda = new Agenda({
    db: {
        address: config.db,
        collection: 'agendaJobs'
    }
});
module.exports = agenda;

module.exports.scheduleJob = function (job) {
    agenda.every(job.interval, job.name, job);
};

module.exports.defineJob = function (jobName) {
    agenda.define(jobName, function (jobSchedule, done) {
        console.log(jobSchedule);
        if (jobSchedule.attrs.data.type === 'url') {
            console.log('TODO WGET URL on ' + jobSchedule.attrs.data.value);
        } else {
            console.log('TODO docker exec');
        }
        done();
    });
};

module.exports.defineAll = function () {

    var mongoose = require('mongoose'),
        Service = mongoose.model('Service'),
        Group = mongoose.model('Group');

    Service.getAllJobs().exec(function (err, data) {
        if (err) {
            console.log('ERROR');
            console.log(err);
        } else {
            if (data[0]) {
                data[0].jobs.forEach(function (job) {
                    agenda.defineJob(job.id);
                });
            }
        }
    });
};
