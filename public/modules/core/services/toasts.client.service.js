'use strict';

angular.module('core').service('Toasts', ['$mdToast',

    function ($mdToast) {
        var toasts = [];

        return {
            closeToast: function (index) {
                toasts.splice(index, 1);
                if (toasts.length === 0) {
                    $mdToast.hide();
                }
            },
            getToasts: function () {
                return toasts;
            },
            addToast: function (text, type, title) {
                var msg = [];
                if (!_.isArray(text)) {
                    msg = text;
                } else {
                    msg.push(text);
                }
                var index = toasts.length;
                if (type !== "danger") {
                    msg = moment().format('hh:mm:ss') + ' ' + msg;
                    type = "success";
                }

                toasts.push({title: title, type: type, msg: msg, index: index});
                $mdToast.show({
                    controller: 'ToastsController',
                    templateUrl: 'modules/core/views/templates/toast.template.html',
                    position: 'bottom',
                    hideDelay: 0
                });
                return index;
            }
        }
    }
]);
