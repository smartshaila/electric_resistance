/**
 * Created by shaila on 10/24/15.
 */

angular.module('resistance_filters', [])
    .filter('result_icon', function() {
        return function(input) {
            if (input == 'success') {
                return 'glyphicon glyphicon-ok btn-primary';
            } else if (input == 'fail') {
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
    });