// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var helpers = require('../config/helpers');

// create a schema
var gameSchema = new Schema({
    result: Boolean,
    mission_number: Number,
    players: [{
        user: { type: Schema.Types.ObjectId, ref: 'User'},
        role: { type: Schema.Types.ObjectId, ref: 'Role'}
    }],
    missions: [{
        result: Boolean,
        capacity: Number,
        fails_needed: Number,
        teams: [{
            leader: { type: Schema.Types.ObjectId, ref: 'User' },
            members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            votes: [{
                user: {type: Schema.Types.ObjectId, ref: 'User'},
                vote: Boolean
            }]
        }],
        votes: [Boolean]
    }]
});

gameSchema.methods.current_mission = function() {
    return this.missions[this.mission_number];
};

gameSchema.methods.current_team = function() {
    return this.current_mission().teams[this.current_mission().teams.length - 1];
};

gameSchema.methods.next_user = function(user) {
    var current_player = this.players.findIndex(function(obj) {
        return obj.user == user;
    });
    return this.players[(current_player + 1) % this.players.length].user;
};

gameSchema.methods.create_team = function(leader) {
    this.current_mission().teams.push({
        leader: leader,
        members: [],
        votes: []
    });
};

gameSchema.methods.setup_game = function(users, roles) {
    this.mission_number = 0;
    this.result = null;
    helpers.shuffle(roles);
    // Assigning rotated users (to maintain user order) to shuffled roles to create players for game.
    var start_user = Math.floor(Math.random() * users.length);
    for (var i = 0; i < users.length; i++) {
        var current_index = (i + start_user) % users.length;
        this.players.push({user: users[current_index], role: role[current_index]});
    }
    var ref_data = helpers.game_reference[users.length];
    ref_data.missions.forEach(function(obj){
        this.missions.push({
            result: null,
            capacity: obj.capacity,
            fails_needed: obj.fails_needed,
            teams: [],
            votes: []
        });
    });
    this.create_team(this.players[0].user);
};

var Game = mongoose.model('Game', gameSchema);

// make this available to our users in our Node applications
module.exports = Game;
