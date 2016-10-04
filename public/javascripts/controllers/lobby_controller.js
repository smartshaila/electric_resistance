app.controller('LobbyController', function ($scope, $window, socket) {
    // Static/reference data here
    $scope.room = {name: room_name || 'Lobby', type: 'lobby'};
    $scope.roles = [];
    $scope.game_reference = [];

    // Variable data here
    $scope.users = [];
    $scope.players = [];
    $scope.selected_role_ids = [];
    $scope.game_options = {lady_enabled: true};
    $scope.me = {};

    // Helper functions here
    var setup_socket = function() {
        socket.emit('join_room', {room: $scope.room});
    };

    $scope.toggle_role_select = function(id) {
        socket.emit('toggle_role_select', {room: $scope.room, _id: id});
        console.log(id);
    };

    $scope.toggle_lady_enabled = function() {
        $scope.game_options.lady_enabled = !$scope.game_options.lady_enabled;
        socket.emit('set_game_options', {room: $scope.room, game_options: $scope.game_options});
    };

    $scope.create_game = function() {
        socket.emit('create_game', {room: $scope.room});
    };

    // Socket listeners here
    socket.on('connect', setup_socket);
    socket.on('console', function(data) {console.log(data)});
    socket.on('update', function (data) {
        $scope.users = data.users;
        $scope.players = data.players;
        $scope.selected_role_ids = data.selected_role_ids;
        $scope.game_options = data.game_options;
        console.log($scope.selected_role_ids);
    });
    socket.on('user', function(data) {
        $scope.me = data.user;
    });
    socket.on('init_data', function(data) {
        $scope.roles = data.roles;
        $scope.game_reference = data.game_reference;
    });
    socket.on('redirect', function(path) {
        $window.location.href = path;
    });

    $scope.add_player = function(_id) {
        socket.emit('add_player', {room: $scope.room, _id: _id});
    };

    $scope.remove_player = function(_id) {
        socket.emit('remove_player', {room: $scope.room, _id: _id});
    };

    $window.onbeforeunload = function () {
        socket.emit('leave_room', {room: $scope.room});
    };
});
