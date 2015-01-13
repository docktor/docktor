'use strict';

angular.module('core').service('Toasts', ['$mdToast', '$timeout',

    function ($mdToast, $timeout) {
        var service = {
            toasts: [],
            forceCloseToast: function (index) {
                this.toasts = _.reject(this.toasts, {'index': index});

                if (this.toasts.length === 0) {
                    $mdToast.hide();
                } else {
                    // refresh list
                    $mdToast.show({
                        controller: 'ToastsController',
                        templateUrl: 'modules/core/views/templates/toast.template.html',
                        position: 'bottom',
                        hideDelay: 0
                    });
                }
            },
            closeToast: function (index) {
                $timeout(function () {
                    service.forceCloseToast(index);
                }, 2000);
            },
            getToasts: function () {
                return this.toasts;
            },
            addToast: function (text, type, title) {
                var msg = [];
                if (!_.isArray(text)) {
                    msg.push(text);
                } else {
                    msg = text;
                }

                var index = _.random(0, 10000000);

                if (type === 'info') {
                    type = 'success';
                } else if (type !== 'danger') {
                    msg = moment().format('hh:mm:ss') + ' ' + msg;
                    type = 'success';
                }
                if (title) {
                    title = title + ':';
                }

                this.toasts.push({title: title, type: type, msg: msg, index: index});

                // timeout to avoid angular material error with many toasts.
                $timeout(function () {
                    $mdToast.hide();
                    $mdToast.show({
                        controller: 'ToastsController',
                        templateUrl: 'modules/core/views/templates/toast.template.html',
                        position: 'bottom',
                        hideDelay: 0,
                        bindToController: true
                    });
                }, 1000);

                return index;
            }
        };
        return service;
    }
]);
