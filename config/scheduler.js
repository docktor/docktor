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
