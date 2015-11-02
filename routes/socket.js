var io = require('../app.js').io;

var game = {
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

function current_mission() {
    return game.missions[game.mission_number];
}

function current_team() {
    return current_mission().teams[current_mission().teams.length - 1];
}

module.exports = function (socket) {
//    console.log(io);
//    console.log(socket);
//    io.emit('console', 'IO test');
//    socket.emit('console', 'SOCKET test');
    io.emit('update', {game: game});
    socket.on('toggle_team_select', function(name) {
        var index = current_team().members.indexOf(name);
        if (index > -1) {
            current_team().members.splice(index, 1);
        } else {
            current_team().members.push(name);
        }
        io.emit('update', {game: game});
    });
};