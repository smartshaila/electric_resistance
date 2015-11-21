app.controller('GameController', function ($scope, $window, socket) {
    // Static/reference data here:
    $scope.room = {name: 'Game', type: 'game'};
    $scope.users = [];
    $scope.roles = [];

    // Variable data here:
    $scope.player = {
        user: {name: 'Guest'},
        role: {name: 'not playing'},
        revealed_players: []
    };
    $scope.game = {
        result: null,
        mission_number: 0,
        missions: [{
            result: null,
            capacity: 1,
            fails_needed: 1,
            teams: [{
                leader: '',
                members: [],
                votes: []
            }],
            votes: []
        }]
    };
    $scope.current_action = {action: '', remaining: []};

    var setup_socket = function() {
        socket.emit('join_room', {room: $scope.room});
    };

    socket.on('connect', setup_socket);
    socket.on('console', function(data) {console.log(data)});

    socket.on('update', function (data) {
        console.log('UPDATE', data);
        $scope.game = data.game;
        $scope.current_action = data.current_action;
    });

    socket.on('user', function(data) {
        console.log('USER', data);
        $scope.player.user = data.user;
        console.log($scope.player.user.name);
    });

    socket.on('init_data', function(data) {
        $scope.users = data.users;
        $scope.roles = data.roles;
    });

    socket.on('revealed_info', function(data) {
        console.log('REVEALED_INFO', data);
        $scope.player.role = data.role;
        $scope.player.revealed_players = data.revealed_players;
    });

    $scope.current_mission = function() {return $scope.game.missions[$scope.game.mission_number]};
    $scope.current_team = function() {return $scope.current_mission().teams[$scope.current_mission().teams.length - 1]};
    $scope.toggle_team_select = function(_id) {
        socket.emit('toggle_team_select', {room: $scope.room, _id: _id});
    };
    $scope.toggle_team_vote = function(vote) {
        socket.emit('toggle_team_vote', {room: $scope.room, user_id: $scope.player.user._id, vote: vote});
    }
    $scope.toggle_mission_vote = function(vote) {
        socket.emit('toggle_mission_vote', {room: $scope.room, user_id: $scope.player.user._id, vote: vote});
    }

    $scope.selected_user = function(_id) {
        return $scope.current_team().members.filter(function (m) {
            return m._id.toString() == _id;
        }).length > 0;
    };

    $scope.member_names = function () {
        return $scope.current_team().members.map(function(m) {return m.name})
    };

    $window.onbeforeunload = function () {
        socket.emit('leave_room', {room: $scope.room});
    };
});

