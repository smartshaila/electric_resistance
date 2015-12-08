/**
 * Created by shaila on 10/24/15.
 */

angular.module('resistance_filters', [])
    .filter('result_icon', function() {
        return function(input) {
            if (input) {
                return 'glyphicon glyphicon-ok btn-primary';
            } else if (input == false) {
                return 'glyphicon glyphicon-remove btn-danger';
            } else {
                return 'glyphicon';
            }
        };
    })
    .filter('sentence', function() {
        return function (arr) {
            var len = arr.length;
            if (len > 0) {
                return arr.reduce(function (a, b, c) {
                    return a + (c - 1 === length ? ', ' : ' and ') + b;
                });
            } else {
                return 'N/A';
            }
        }
    })
    .filter('connection_icon', function() {
        return function(status) {
            if (status) {
                return 'online';
            } else {
                return 'offline';
            }
        };
    })
    .filter('faction_style', function() {
        return function(faction) {
            if (faction == 'good'){
                return 'text-info';
            } else if (faction == 'evil'){
                return 'text-danger';
            } else {
                return 'text-warning';
            }
        };
    })
    .filter('faction_icon', function() {
        return function(faction) {
          if (faction == 'good'){
              return 'glyphicon glyphicon-knight';
          } else if (faction == 'evil'){
              return 'glyphicon glyphicon-fire';
          } else {
              return 'glyphicon glyphicon-question-sign';
          }
        };
    })
    .filter('not_default', function() {
        return function(roles) {
            return roles.filter(function(r){
                return !r.default;
            });
        };
    })
    .filter('default', function() {
        return function(roles) {
            return roles.filter(function(r){
                return r.default;
            });
        };
    })
    .filter('vote_filter', function() {
        return function(votes, result) {
            return votes.filter(function(v){
                return v.vote == result;
            });
        };
    })
    .filter('vote_count', function() {
        return function(votes, result) {
            return votes.filter(function(v){
                return v.vote == result;
            }).length;
        };
    })
    .filter('mission_vote_count', function() {
        return function(votes, result) {
            return votes.filter(function(v){
                return v == result;
            }).length;
        };
    })
    .filter('show_panel', function() {
        return function(panel, scope) {
            if (panel == 'mission_info') {
                if (scope.current_page == 'home') {
                    return '';
                } else {
                    return 'hidden-xs hidden-sm'
                }
            } else if (panel == 'game_info') {
                if (scope.current_page == 'home') {
                    return '';
                } else {
                    return 'hidden'
                }
            } else if (panel == 'team_select') {
                if (scope.current_page == 'vote'
                    && (scope.current_action.action == 'team_select' || scope.current_action.action == 'team_vote')
                    && scope.display_mission_index == -1
                    && scope.display_team_index == -1
                    && scope.current_team().leader._id == scope.player.user._id) {
                    return '';
                } else {
                    return 'hidden';
                }
            } else if (panel == 'lady') {
                if (scope.current_page == 'vote'
                    && scope.current_action.action == 'lady'
                    && scope.display_mission_index == -1
                    && scope.display_team_index == -1
                    && scope.current_mission().lady.source
                    && scope.current_mission().lady.source._id == scope.player.user._id) {
                    return '';
                } else {
                    return 'hidden';
                }
            } else if (panel == 'team_vote') {
                if (scope.current_page == 'vote'
                    && scope.current_action.action == 'team_vote'
                    && scope.display_mission_index == -1
                    && scope.display_team_index == -1
                    && scope.current_team().leader._id != scope.player.user._id) {
                    return '';
                } else {
                    return 'hidden';
                }
            } else if (panel == 'mission_vote') {
                if (scope.current_page == 'vote'
                    && scope.current_action.action == 'mission_vote'
                    && scope.display_mission_index == -1
                    && scope.display_team_index == -1
                    && _.any(scope.current_team().members, function(user) {return user._id == scope.player.user._id})) {
                    return '';
                } else {
                    return 'hidden';
                }
            } else if (panel == 'revealed_info') {
                if (scope.current_page == 'info') {
                    return '';
                } else {
                    return 'hidden';
                }
            } else if (panel == 'assassinate') {
                if (scope.player.role.name == 'Assassin') {
                    return '';
                } else {
                    return 'hidden';
                }
            } else {
                return '';
            }
        }
    })
    .filter('selected', function() {
        return function(obj, reference_obj) {
            return obj == reference_obj ? 'active' : '';
        }
    })
    .filter('rejected_team', function() {
        return function(index) {
            return index == -1 ? 'hidden' : '';
        }
    })
    .filter('accepted_team', function() {
        return function(index) {
            return index != -1 ? 'hidden' : '';
        }
    })
    .filter('passed_mission', function() {
        return function(votes) {
            return (votes.length > 0 && !_.contains(votes, false)) ? '' : 'hidden';
        }
    })
    .filter('failed_mission', function() {
        return function(votes) {
            return (votes.length > 0 && _.contains(votes, false)) ? '' : 'hidden';
        }
    })
    .filter('alert_include', function() {
        return function(remaining, name) {
            if (remaining.length > 0) {
                return _.contains(remaining, name) ? 'alert-danger' : 'alert-warning';
            } else {
                return 'hidden';
            }
        }
    })
    .filter('game_end', function() {
        return function(status) {
            return status == 'game_end' ? '' : 'hidden';
        }
    })
    ;

