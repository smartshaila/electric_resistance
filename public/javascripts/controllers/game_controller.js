app.controller('GameController',
    function ($scope, $rootScope, socket) {
        $scope.room = {name: 'Game', type: 'game'};
        var setup_socket = function() {
            socket.emit('join_room', {room: $scope.room});
        };
        socket.on('connect', setup_socket);
//        socket.on('reconnect', setup_socket);
        socket.on('console', function(data) {console.log(data)});
        socket.on('update', function (data) {
            console.log('UPDATE', data);
            $scope.game = data.game;
        });
        socket.on('user', function(data) {
            $scope.me = data.user;
        });
        $scope.current_mission = function() {return $scope.game.missions[$scope.game.mission_number]};
        $scope.current_team = function() {return $scope.current_mission().teams[$scope.current_mission().teams.length - 1]};
        $scope.toggle_team_select = function(name) {
            socket.emit('toggle_team_select', {room: $scope.room, name: name});
        };
        $scope.players = [
            {'name': 'Nicholas', 'logged_in': true},
            {'name': 'Shaila', 'logged_in': false},
            {'name': 'Krista', 'logged_in': true},
            {'name': 'Hitanshu', 'logged_in': true},
            {'name': 'Sneha', 'logged_in': false}
        ];
        $scope.roles = [
            {'name': 'Merlin', 'faction': 'good', 'count': 1},
            {'name': 'Assassin', 'faction': 'evil', 'count': 1},
            {'name': 'Percival', 'faction': 'good', 'count': 1},
            {'name': 'Morgana', 'faction': 'evil', 'count': 1},
            {'name': 'Loyal Servant of Arthur', 'faction': 'good', 'count': 1}
        ];
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
    }
);
