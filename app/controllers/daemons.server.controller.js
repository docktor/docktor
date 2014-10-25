'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend daemon's controller
 */
module.exports = _.extend(
    require('./daemons/daemons.crud'),
    require('./daemons/daemons.docker')
);