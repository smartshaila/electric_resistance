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
var selected_role_ids = [];

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
    io.sockets.in(room).emit('update', {users: lobby_users, selected_role_ids: selected_role_ids});
}

module.exports = function (io) {
    io.on('connection', function(socket) {
        socket.user = socket.request.user;
        console.log('Connected client: ' + socket.user.name);
        socket.emit('user', {user: socket.user});
        socket.on('join_room', function(data) {
            console.log(socket.user.name, 'has joined', data.room.name);
            socket.join(data.room.name);
            socket.room = data.room;
            if (data.room.type == 'game') {
                update_game(io, data.room.name);
            } else if (data.room.type == 'lobby') {
                lobby_users.push({user: socket.user, logged_in: true});
                socket.emit('init_data', {roles: helpers.role_list, game_reference: helpers.game_reference});
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
            // Make a copy in case it doesn't conform to faction requirements
            var existing_selected_roles = selected_role_ids.slice(0);
            var index = selected_role_ids.indexOf(data._id);
            if (index > -1) {
                selected_role_ids.splice(index, 1);
            } else {
                selected_role_ids.push(data._id);
            }

            // Get faction count
            var faction_counts = helpers.faction_counts(selected_role_ids);

            helpers.game_reference[lobby_users.length].factions.forEach(function(f) {
                if ((faction_counts[f.faction] || 0) > f.count) {
                    selected_role_ids = existing_selected_roles.slice(0);
                }
            });

            update_lobby(io, data.room.name);
        });

        socket.on('disconnect', function() {
            if (socket.room != null && socket.room.type == 'lobby') {
                lobby_users = lobby_users.filter(function(u) {
                    return u.user._id != socket.user._id;
                });
                update_lobby(io, socket.room.name);
            }
            console.log('Disconnected client: ' + socket.user.name);
        });
    });
};
