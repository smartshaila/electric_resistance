var helpers = require('../config/helpers');
var Game = require('../models/game');
var __ = require('underscore');

var game = {};
var all_games = [];
var all_lobbies = { 'Shaila Lobby': {
    users: [],
    players: [],
    selected_roles: [],
    game_options: {}
}};
var lobby_template = {
    users: [],
    players: [],
    selected_roles: [],
    game_options: {lady_enabled: false}
}

Game.findPopulated({}, function (err, games) {
    game = games[games.length - 1];
});

Game.findPopulated({}, function (err, games) {
    all_games = games;
});

var lobby_users = [];
var lobby_players = [];
var selected_role_ids = [];
var game_options = {lady_enabled: true};

function update_game(io, room) {
    game.save();
    io.sockets.in(room).emit('update', {
        game: game.display_safe(),
        current_action: game.current_action(),
        valid_lady_targets: game.valid_lady_targets()
    });
}

function update_role_data(socket) {
    socket.emit('role_data', __.values(game.players.reduce(function (res, player) {
        var count = res[player.role._id] ? res[player.role._id].count + 1 : 1;
        res[player.role._id] = {
            _id: player.role._id,
            name: player.role.name,
            faction: player.role.faction,
            count: count
        };
        return res;
    }, {})));
}

function update_revealed_data(socket) {
    socket.emit('revealed_info', game.revealed_info(socket.user._id));
}

function update_hall_data(io, room) {
    io.sockets.in(room).emit('update', {
        games: all_games,
        lobbies: all_lobbies
    });
}

function update_user_data(io, room) {
    io.sockets.in(room).emit('user_data', game.players.map(function (p) {
        return {
            _id: p.user._id,
            name: p.user.name,
            logged_in: p.logged_in
        };
    }));
}

function update_lobby(io, room) {
    io.sockets.in(room).emit('update', {
        users: all_lobbies[room].users,
        players: all_lobbies[room].players,
        selected_role_ids: all_lobbies[room].selected_role_ids,
        game_options: all_lobbies[room].game_options
    });
}

module.exports = function (io) {
    io.on('connection', function (socket) {
        socket.user = socket.request.user;
        console.log('Connected client: ' + socket.user.name);
        socket.emit('user', {
            user: socket.user
        });

        socket.on('join_room', function (data) {
            console.log(socket.user.name, 'has joined', data.room.name);
            socket.join(data.room.name);
            socket.room = data.room;
            if (data.room.type == 'game') {
                var player = __.find(game.players, function(p) {return p.user._id.equals(socket.user._id)});
                if (player) {
                    player.logged_in = true;
                }
                update_role_data(socket);
                update_user_data(io, data.room.name);
                update_revealed_data(socket);
                update_game(io, data.room.name);
            } else if (data.room.type == 'lobby') {
                if (!all_lobbies[data.room.name]) {
                    all_lobbies[data.room.name] = __.clone(lobby_template);
                }
                var player = __.find(all_lobbies[data.room.name].players, function(p) {return p.user._id.equals(socket.user._id)});
                if (player) {
                    player.logged_in = true;
                } else {
                    all_lobbies[data.room.name].users.push({
                        user: socket.user,
                        logged_in: true
                    });
                }
                socket.emit('init_data', {
                    roles: helpers.role_list,
                    game_reference: helpers.game_reference
                });
                update_lobby(io, data.room.name);
                update_hall_data(io, 'Hall');
            } else if (data.room.type == 'hall') {
                update_hall_data(io, data.room.name);
            }
        });

        socket.on('leave_room', function (data) {
            console.log(socket.user.name, 'has left', data.room.name);
            socket.leave(data.room.name);
            if (data.room.type == 'game') {
                var player = __.find(game.players, function(p) {return p.user._id.equals(socket.user._id)});
                if (player) {
                    player.logged_in = false;
                }
                update_user_data(io, data.room.name);
            } else if (data.room.type == 'lobby') {
                var player = __.find(lobby_players, function(p) {return p.user._id.equals(socket.user._id)});
                if (player) {
                    player.logged_in = false;
                } else {
                    lobby_users = lobby_users.filter(function (u) {
                        return !u.user._id.equals(socket.user._id);
                    });
                }
                update_lobby(io, data.room.name);
            }
        });

        socket.on('toggle_team_select', function (data) {
            if (socket.user._id.equals(game.current_team().leader._id)) {
                game.toggle_team_select(data._id);
                game.deepPopulate('missions.teams.members', function () {
                    update_game(io, data.room.name);
                });
            }
        });

        socket.on('toggle_team_vote', function (data) {
            game.toggle_team_vote(data.user_id, data.vote);
            game.deepPopulate('missions.votes.user', function() {
                user_vote = __.find(game.current_team().votes, function(v) {return v.user._id.equals(socket.user._id)});
                socket.emit('team_vote_result', user_vote);
                update_game(io, data.room.name);
            });
        });

        socket.on('toggle_mission_vote', function (data) {
            game.toggle_mission_vote(data.user_id, data.vote);
            game.addPopulations(function() {
                user_vote = __.find(game.current_mission().votes, function(v) {return v.user._id.equals(socket.user._id)});
                socket.emit('mission_vote_result', user_vote);
                update_game(io, data.room.name);
            });
        });

        socket.on('toggle_role_select', function (data) {
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

            helpers.game_reference[lobby_players.length].factions.forEach(function (f) {
                if ((faction_counts[f.faction] || 0) > f.count) {
                    selected_role_ids = existing_selected_roles.slice(0);
                }
            });

            update_lobby(io, data.room.name);
        });

        socket.on('set_game_options', function (data) {
            game_options = data.game_options;
            update_lobby(io, data.room.name);
        });

        socket.on('add_player', function (data) {
            var player = __.find(lobby_users, function(u) {return u.user._id.equals(data._id)});
            lobby_players.push(player);
            lobby_users = lobby_users.filter(function(u) {
                return !u.user._id.equals(data._id);
            });
            update_lobby(io, data.room.name);
        });

        socket.on('remove_player', function(data) {
            var player = __.find(lobby_players, function(u) {return u.user._id.equals(data._id)});
            lobby_users.push(player);
            lobby_players = lobby_players.filter(function(u) {
                return !u.user._id.equals(data._id);
            });
            update_lobby(io, data.room.name);
        });

        socket.on('select_lady_target', function (data) {
            if (game.current_mission().lady.source && socket.user._id.equals(game.current_mission().lady.source._id)) {
                game.select_lady_target(data._id);
            }
            game.deepPopulate('missions.lady.source missions.lady.target', function() {
                update_revealed_data(socket);
                update_game(io, data.room.name);
                update_revealed_data(socket);
            });
        });

        socket.on('assassinate', function(data) {
            var player = __.find(game.players, function(p) {return p.user._id.equals(data._id)});
            console.log('Assassinating:', player);
            game.result = (player.role.name != 'Merlin');
            update_game(io, data.room.name);
        });

        socket.on('create_game', function (data) {
            var g = new Game({});
            g.setup_game(lobby_players.map(function(u){return u.user._id}), selected_role_ids, game_options);
            lobby_players = [];
            selected_role_ids = [];
            game_options = { lady_enabled: true };
            g.save(function(err, new_game) {
                new_game.addPopulations(function (err, updated_game){
                    game = updated_game;
                    io.sockets.in(data.room.name).emit('redirect', '/game');
                });
            });
        });

        socket.on('disconnect', function () {
            if (socket.room != null && socket.room.type == 'lobby') {
                all_lobbies[socket.room.name].users = all_lobbies[socket.room.name].users.filter(function (u) {
                    return u.user._id != socket.user._id;
                });
                if (all_lobbies[socket.room.name].users.length + all_lobbies[socket.room.name].players.length == 0) {
                    delete all_lobbies[socket.room.name];
                    update_hall_data(io, 'Hall');
                } else {
                    update_lobby(io, socket.room.name);
                }
            }
            console.log('Disconnected client: ' + socket.user.name);
        });
    });
};
