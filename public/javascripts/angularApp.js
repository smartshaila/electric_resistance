/**
 * Created by shaila on 10/23/15.
 */

angular
    .module('electric_resistance', ['resistance_filters'])
    .controller('GameController',
        function ($scope) {
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
            $scope.current_mission = function() {return $scope.game.missions[$scope.game.mission_number]};
            $scope.current_team = function() {return $scope.current_mission().teams[$scope.current_mission().teams.length - 1]};
            $scope.game = {
                'result': null,
                'mission_number': 3,
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
