app.controller('GameController',
    function ($scope, $window, socket) {
        $scope.room = {name: 'Game', type: 'game'};

        var setup_socket = function() {
            socket.emit('join_room', {room: $scope.room});
        };

        socket.on('connect', setup_socket);
        socket.on('console', function(data) {console.log(data)});

        socket.on('update', function (data) {
            console.log('UPDATE', data);
            $scope.game = data.game;
        });

        socket.on('user', function(data) {
            $scope.me = data.user;
        });

        $scope.users = [];
        $scope.roles = [];
        $scope.role = {};

        socket.on('init_data', function(data) {
            $scope.users = data.users;
            $scope.roles = data.roles;
        });

        socket.on('player_details', function(data){
            $scope.role = data.role;
        });

        $scope.current_mission = function() {return $scope.game.missions[$scope.game.mission_number]};
        $scope.current_team = function() {return $scope.current_mission().teams[$scope.current_mission().teams.length - 1]};
        $scope.toggle_team_select = function(id) {
            socket.emit('toggle_team_select', {room: $scope.room, id: id});
        };

        $scope.selected_user = function(id) {
            return $scope.current_team().members.filter(function (m) {
                return m._id == id;
            }).length > 0;
        };

        $scope.member_names = function () {
            return $scope.current_team().members.map(function(m) {return m.name})
        };

        $scope.waiting_on = ['Shaila', 'Nicholas', 'Hitanshu'];
        $scope.waiting_for = 'log in';
        $scope.user = {
            'name': 'Shaila',
            'user_id': 1
        };
        $scope.player = {
            'role': 'Merlin',
            'revealed_roles': [
                {'name': 'Nick', 'faction': 'evil'},
                {'name': 'Krista', 'faction': 'evil'}
            ]
        };
        $scope.game = {
            'result': null,
            'mission_number': 1,
            'missions': [
                {
                    'result': 'success',
                    'capacity': 2,
                    'fails_needed': 1,
                    'teams': [
                        {
                            'leader': 'Shaila',
                            'members': ['Shaila', 'Krista'],
                            'votes': [
                                {'name': 'Nicholas', 'vote': 'approve'},
                                {'name': 'Shaila', 'vote': 'approve'},
                                {'name': 'Krista', 'vote': 'approve'},
                                {'name': 'Hitanshu', 'vote': 'reject'},
                                {'name': 'Sneha', 'vote': 'reject'}
                            ]
                        }
                    ],
                    'votes': ['pass', 'pass']
                },
                {
                    'result': 'fail',
                    'capacity': 3,
                    'fails_needed': 1,
                    'teams': [
                        {
                            'leader': 'Krista',
                            'members': ['Shaila', 'Krista', 'Nicholas'],
                            'votes': [
                                {'name': 'Nicholas', 'vote': 'approve'},
                                {'name': 'Shaila', 'vote': 'approve'},
                                {'name': 'Krista', 'vote': 'approve'},
                                {'name': 'Hitanshu', 'vote': 'reject'},
                                {'name': 'Sneha', 'vote': 'reject'}
                            ]
                        }
                    ],
                    'votes': ['pass', 'pass', 'fail']
                },
                {
                    'result': 'success',
                    'capacity': 2,
                    'fails_needed': 1,
                    'teams': [
                        {
                            'leader': 'Hitanshu',
                            'members': ['Hitanshu', 'Sneha'],
                            'votes': [
                                {'name': 'Nicholas', 'vote': 'reject'},
                                {'name': 'Shaila', 'vote': 'reject'},
                                {'name': 'Krista', 'vote': 'reject'},
                                {'name': 'Hitanshu', 'vote': 'approve'},
                                {'name': 'Sneha', 'vote': 'approve'}
                            ]
                        },
                         {
                            'leader': 'Sneha',
                            'members': ['Shaila', 'Sneha'],
                            'votes': [
                                {'name': 'Nicholas', 'vote': 'reject'},
                                {'name': 'Shaila', 'vote': 'approve'},
                                {'name': 'Krista', 'vote': 'approve'},
                                {'name': 'Hitanshu', 'vote': 'reject'},
                                {'name': 'Sneha', 'vote': 'approve'}
                            ]
                        }
                    ],
                    'votes': ['pass', 'pass']
                },
                {
                    'result': null,
                    'capacity': 3,
                    'fails_needed': 2,
                    'teams': [
                        {
                            'leader': 'Nicholas',
                            'members': [],
                            'votes': [
                                {'name': 'Nicholas', 'vote': null},
                                {'name': 'Shaila', 'vote': null},
                                {'name': 'Krista', 'vote': null},
                                {'name': 'Hitanshu', 'vote': null},
                                {'name': 'Sneha', 'vote': null}
                            ]
                        }
                    ],
                    'votes': []
                },
                {
                    'result': null,
                    'capacity': 3,
                    'fails_needed': 1,
                    'teams': [],
                    'votes': []
                }
            ]
        };

        $window.onbeforeunload = function () {
            socket.emit('leave_room', {room: $scope.room});
        };
    }
);

