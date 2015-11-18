// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
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

gameSchema.plugin(deepPopulate);

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

gameSchema.methods.setup_game = function(user_ids, role_ids) {
    var self = this;
    self.mission_number = 0;
    self.missions = [];
    self.players = [];
    self.result = null;

    var faction_counts = helpers.faction_counts(role_ids);
    helpers.game_reference[user_ids.length].factions.forEach(function(f) {
        if ((faction_counts[f.faction] || 0) < f.count) {
            for (var i = 0; i < (f.count - (faction_counts[f.faction] || 0)); i++) {
                role_ids.push(helpers.default_roles[f.faction]);
            }
        }
    });
    helpers.shuffle(role_ids);

    // Assigning rotated users (to maintain user order) to shuffled roles to create players for game.
    var start_user = Math.floor(Math.random() * user_ids.length);
    for (var i = 0; i < user_ids.length; i++) {
        var current_index = (i + start_user) % user_ids.length;
        var player = {user: user_ids[current_index], role: role_ids[current_index]};
        console.log(player);
        self.players.push(player);
    }
    var ref_data = helpers.game_reference[user_ids.length];
    ref_data.missions.forEach(function(obj){
        self.missions.push({
            result: null,
            capacity: obj.capacity,
            fails_needed: obj.fails_needed,
            teams: [],
            votes: []
        });
    });
    self.create_team(self.players[0].user);
};

gameSchema.statics.findPopulated = function(filter, callback) {
    this.find(filter).deepPopulate('players.user players.role missions.teams.leader missions.teams.members missions.teams.votes.user').exec(callback);
}

var Game = mongoose.model('Game', gameSchema);

// make this available to our users in our Node applications
module.exports = Game;
