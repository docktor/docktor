'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', 'Socket',
    function ($scope, Authentication, Menus, Socket) {
        $scope.authentication = Authentication;
        $scope.menu = Menus.getMenu('topbar');
        $scope.nbMessages = 0;
        $scope.messages = [];

        Socket.on('who are you', function (user) {
            Socket.emit('check in', {user: Authentication.user});
        });

        Socket.on('error', function(message) {
            $scope.nbMessages++;
            $scope.messages.push(message);
            console.log(message);
        });

    }
]);
