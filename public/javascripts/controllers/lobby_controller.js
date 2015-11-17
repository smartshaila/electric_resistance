app.controller('LobbyController',
    function ($scope, $window, socket) {
        // Static/reference data here
        $scope.room = {name: 'Lobby', type: 'lobby'};
        $scope.roles = [];
        $scope.game_reference = [];

        // Variable data here
        $scope.users = [];
        $scope.selected_role_ids = [];
        $scope.me = {};

        // Helper functions here
        var setup_socket = function() {
            socket.emit('join_room', {room: $scope.room});
        };

        $scope.toggle_role_select = function(id) {
            console.log(id);
            var faction_counts = $scope.roles.filter(function(r) {
                return $scope.selected_role_ids.indexOf(r._id) > -1;
            });
            console.log(faction_counts);
            faction_counts = faction_counts.reduce(function(res, obj){
                res[obj.faction] = ((res[obj.faction]) ? res[obj.faction] + 1 : 1);
                return res;
            }, {});
            console.log(faction_counts);
            socket.emit('toggle_role_select', {room: $scope.room, _id: id});
        };

        // Socket listeners here
        socket.on('connect', setup_socket);
        socket.on('console', function(data) {console.log(data)});
        socket.on('update', function (data) {
            console.log('UPDATE');
            $scope.users = data.users;
            $scope.selected_role_ids = data.selected_role_ids;
        });
        socket.on('user', function(data) {
            $scope.me = data.user;
        });
        socket.on('init_data', function(data) {
            $scope.roles = data.roles;
            $scope.game_reference = data.game_reference;
        });
        $window.onbeforeunload = function () {
            socket.emit('leave_room', {room: $scope.room});
        };
    }
);
