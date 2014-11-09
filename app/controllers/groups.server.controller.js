'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend groups's controller
 */
module.exports = _.extend(
    require('./groups/groups.crud.server.controller'),
    require('./groups/groups.docker.server.controller')
);
