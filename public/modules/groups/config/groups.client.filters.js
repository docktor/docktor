'use strict';

angular.module('groups').filter('definition', function () {
    return function (dd, dt, delim) {

        if (dd) {
            var output = '';
            if (typeof dd === 'object') {
                for(var p in dd) {
                    if (output.length > 0) {
                        output += '<br/>';
                    }
                    output += p + ' : <em>' + dd[p] + '</em>';
                }
            } else {
                output = dd;
                if (delim) {
                    output = output.split(delim).join('<br/>');
                }
            }
            return '<dt>' + dt + '</dt><dd>' + output + '</dd>';
        } else {
            return '<dt>' + dt + '</dt><dd> - </dd>';
        }
    };
});

angular.module('groups').filter('volumes', function () {
    return function (volumes, volumesRW) {
        var output = '';
        for(var vol in volumes) {
            var ro = true;
            if (volumesRW) {
                if (volumes[vol]) {
                    ro = false;
                } else {
                    ro = true;
                }
                output += '<dt>' + vol + ' - ' + (ro ? 'RO' : 'RW') + '</dt><dd>' + volumes[vol] + '</dd>';
            } else {
                output += '<dt>' + vol + '</dt><dd>' + volumes[vol] + '</dd>';
            }
        }
        return output;
    };
});

angular.module('groups').filter('portBindings', function () {
    return function (portBindings) {
        var output = '';
        for (var binding in portBindings) {
            output += '<dt>' + binding + '</dt><dd>';
            for (var i = 0; i < portBindings[binding].length ; i++) {
                output += (portBindings[binding][i].HostIp || '0.0.0.0' ) + ':' + portBindings[binding][i].HostPort;
            }
            output += '</dd>';
        }
        return output;
    };
});
