'use strict';

angular.module('core').service('Toasts', ['$mdToast', '$timeout',

    function ($mdToast, $timeout) {
        var service = {
            toasts: [],
            forceCloseToast: function (index) {
                if (this.toasts.length === 1) {
                    this.toasts = [];
                    $mdToast.hide();
                } else {
                    this.toasts.splice(index, 1);
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
                var index = this.toasts.length;
                if (type !== "danger") {
                    msg = moment().format('hh:mm:ss') + ' ' + msg;
                    type = "success";
                }
                if (title) {
                    title = title + ':';
                }

                this.toasts.push({title: title, type: type, msg: msg, index: index});
                $mdToast.show({
                    controller: 'ToastsController',
                    templateUrl: 'modules/core/views/templates/toast.template.html',
                    position: 'bottom',
                    hideDelay: 0
                });
                return index;
            }
        };
        return service;
    }
]);
