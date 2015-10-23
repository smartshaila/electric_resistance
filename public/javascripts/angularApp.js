/**
 * Created by shaila on 10/23/15.
 */

angular
    .module('electric_resistance', [])
    .controller('GameController',
        function ($scope) {
            $scope.players = [
                {'name': 'Nicholas', 'logged_in': true},
                {'name': 'Shaila', 'logged_in': false},
                {'name': 'Krista', 'logged_in': true},
                {'name': 'Hitanshu', 'logged_in': true},
                {'name': 'Sneha', 'logged_in': false}
            ];
            $scope.roles = ['Merlin', 'Assassin', 'Percival', 'Morgana', 'Loyal Servant of Arthur'];
            $scope.waiting_on = ['Shaila'];
            $scope.waiting_for = 'log in';
            $scope.mission_number = 3;
        }
    );
