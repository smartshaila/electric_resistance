var helpers = require('../config/helpers');
var Game = require('../models/game');

var game = {};

Game.findPopulated({}, function (err, games) {
    game = games[games.length - 1];
});

var lobby_users = [];
var selected_role_ids = [];

function update_game(io, room) {
    console.log('Update Game for ', room);
    io.sockets.in(room).emit('update', {game: game});
}

function set_game_data() {
    var role_hash = game.players.reduce(function(res, player) {
        var count = res[player.role._id] ? res[player.role._id].count + 1 : 1;
        res[player.role._id] = {
            id: player.role._id,
            name: player.role.name,
            faction: player.role.faction,
            count: count
        };
        return res;
    }, {});

    console.log(role_hash);

    return {
        users: game.players.map(function (p) {
            return {
                id: p.user._id,
                name: p.user.name,
                logged_in: p.logged_in
            };
        }),
        roles: Object.keys(role_hash).map(function(k) {
            return role_hash[k];
        })
    };
}

function display_player_details(user_id) {
    var role = game.players.filter(function(p) {
        return p.user._id.equals(user_id);
    })[0].role;
    return {
        role: role
    }
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
                console.log(game.players);
                var index = game.players.map(function (p) {
                    return p.user._id.toString();
                }).indexOf(socket.user._id.toString());

                if (index > -1) {
                    game.players[index].logged_in = true;
                }
                socket.emit('init_data', set_game_data());
                socket.emit('player_details', display_player_details(socket.user._id));
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
                var index = game.players.map(function (p) {
                    return p.user._id.toString();
                }).indexOf(socket.user._id.toString());
                if (index > -1) {
                    game.players[index].logged_in = false;
                }
                var game_data = set_game_data();
                io.sockets.in(data.room.name).emit('init_data', game_data);
            } else if (data.room.type == 'lobby') {
                lobby_users = lobby_users.filter(function(u) {
                    return u.user._id != socket.user._id;
                });
                update_lobby(io, data.room.name);
            }
        });

        socket.on('toggle_team_select', function(data) {
            var index = game.current_team().members.map(function(m) {
                return m._id.toString();
            }).indexOf(data.id);
            if (index > -1) {
                game.current_team().members.splice(index, 1);
                update_game(io, data.room.name);
            } else {
                game.current_team().members.push(data.id);
                game.deepPopulate('missions.teams.members', function(err, obj) {
                    update_game(io, data.room.name);
                });
            }
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

        socket.on('create_game', function(data) {
            var g = new Game({});
            g.setup_game(lobby_users.map(function(u){return u.user._id}), selected_role_ids);
            g.save(function(err, new_game) {
                new_game.addPopulations(function (err, updated_game){
                    game = updated_game;
                    io.sockets.in(data.room.name).emit('redirect', '/game');
                });
            });
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
