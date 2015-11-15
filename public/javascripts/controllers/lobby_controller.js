app.controller('LobbyController',
    function ($scope, $rootScope, socket) {
        $scope.room = {name: 'Lobby', type: 'lobby'};
        $scope.users = [];
        $scope.me = {};
        var setup_socket = function() {
            socket.emit('join_room', {room: $scope.room});
        }
        socket.on('connect', setup_socket);
        socket.on('console', function(data) {console.log(data)});
        socket.on('update', function (data) {
            console.log('UPDATE');
            $scope.users = data.users;
            $scope.me = data.me;
        });
    }
);
