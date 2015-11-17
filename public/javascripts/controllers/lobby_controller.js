app.controller('LobbyController',
    function ($scope, $window, socket) {
        $scope.room = {name: 'Lobby', type: 'lobby'};
        $scope.users = [];
        $scope.roles = [];
        $scope.me = {};
        var setup_socket = function() {
            socket.emit('join_room', {room: $scope.room});
        };
        socket.on('connect', setup_socket);
        socket.on('console', function(data) {console.log(data)});
        socket.on('update', function (data) {
            console.log('UPDATE');
            $scope.users = data.users;
        });
        socket.on('user', function(data) {
            $scope.me = data.user;
        });
        socket.on('role_list', function(data) {
            $scope.roles = data.roles;
        });
        $window.onbeforeunload = function () {
            socket.emit('leave_room', {room: $scope.room});
        };
    }
);
