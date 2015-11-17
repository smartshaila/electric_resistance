var Role = require('../models/role');
var helpers = require('../config/helpers');

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

var lobby_users = [];
var role_list = [];
var selected_roles = [];

Role.find({}, function(err, roles) {
    if (err) throw err;
    role_list = roles;
});

function current_mission() {
    return game.missions[game.mission_number];
}

function current_team() {
    return current_mission().teams[current_mission().teams.length - 1];
}

function update_game(io, room) {
    console.log('Update Game for ', room);
//    console.dir(io.sockets.in(room));
    io.sockets.in(room).emit('update', {game: game});
}

function update_lobby(io, room) {
    io.sockets.in(room).emit('update', {users: lobby_users, selected_roles: selected_roles});
}

module.exports = function (io) {
    io.on('connection', function(socket) {
        socket.user = socket.request.user;
        console.log('Connected client: ' + socket.user.name);
        socket.emit('user', {user: socket.user});
        socket.on('join_room', function(data) {
            console.log(socket.user.name, 'has joined', data.room.name);
            socket.join(data.room.name);
            if (data.room.type == 'game') {
                update_game(io, data.room.name);
            } else if (data.room.type == 'lobby') {
                lobby_users.push({user: socket.user, logged_in: true});
                socket.emit('init_data', {roles: role_list, game_reference: helpers.game_reference});
                update_lobby(io, data.room.name);
            }
        });
        socket.on('leave_room', function(data) {
            console.log(socket.user.name, 'has left', data.room.name);
            socket.leave(data.room.name);
            if (data.room.type == 'game') {

            } else if (data.room.type == 'lobby') {
                lobby_users = lobby_users.filter(function(u) {
                    return u.user._id != socket.user._id;
                });
                update_lobby(io, data.room.name);
            }
        });
//        io.emit('update', {game: game});
        socket.on('toggle_team_select', function(data) {
            var index = current_team().members.indexOf(data.name);
            if (index > -1) {
                current_team().members.splice(index, 1);
            } else {
                current_team().members.push(data.name);
            }
            console.log(data.name);
            console.dir(current_team());
            update_game(io, data.room.name);
        });

        socket.on('toggle_role_select', function(data) {
            var index = selected_roles.indexOf(data._id);
            if (index > -1) {
                selected_roles.splice(index, 1);
            } else {
                selected_roles.push(data._id);
            }
            console.log(data._id);
            update_lobby(io, data.room.name);
        });

        socket.on('disconnect', function() {
            console.log('Disconnected client: ' + socket.user.name);
        });
    });
};
