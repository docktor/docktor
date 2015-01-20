'use strict';

var version = require('../../app/controllers/version.server.controller');

module.exports = function (app) {
    var core = require('../../app/controllers/core.server.controller');
    app.route('/').get(core.index);

    app.route('/version/info').get(version.getInfo);

};
