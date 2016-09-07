app.controller('HallController', function ($scope, $window, socket) {
    // Static/reference data here
    $scope.room = {name: 'Hall', type: 'hall'};

    // Variable data here
    $scope.games = [];
    $scope.lobbies = [];
    $scope.me = {};
    $scope.lobby_name = '';

    // Helper functions here
    var setup_socket = function() {
        socket.emit('join_room', {room: $scope.room});
    };

    $scope.create_lobby = function() {
        $window.location.href = '/lobby/' + $scope.lobby_name;
    };

    // Socket listeners here
    socket.on('connect', setup_socket);
    socket.on('console', function(data) {console.log(data)});
    socket.on('update', function (data) {
        $scope.games = data.games;
        $scope.lobbies = data.lobbies;
    });
    socket.on('user', function(data) {
        $scope.me = data.user;
    });
    socket.on('redirect', function(path) {
        $window.location.href = path;
    });

    $window.onbeforeunload = function () {
        socket.emit('leave_room', {room: $scope.room});
    };
});

