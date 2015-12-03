// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var helpers = require('../config/helpers');
var populate_string = 'players.user players.role players.role.revealed_roles missions.votes.user missions.teams.leader missions.teams.members missions.teams.votes.user missions.lady.source missions.lady.target';
var __ = require('underscore');

// create a schema
var gameSchema = new Schema({
    action_sleep: Boolean,
    result: Boolean,
    mission_number: Number,
    players: [{
        user: { type: Schema.Types.ObjectId, ref: 'User'},
        role: { type: Schema.Types.ObjectId, ref: 'Role'},
        logged_in: Boolean
    }],
    missions: [{
        result: Boolean,
        capacity: Number,
        fails_needed: Number,
        lady: {
            source: { type: Schema.Types.ObjectId, ref: 'User' },
            target: { type: Schema.Types.ObjectId, ref: 'User' }
        },
        teams: [{
            leader: { type: Schema.Types.ObjectId, ref: 'User' },
            members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            votes: [{
                user: {type: Schema.Types.ObjectId, ref: 'User'},
                vote: Boolean
            }]
        }],
        votes: [{
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            vote: Boolean
        }]
    }]
});

gameSchema.plugin(deepPopulate);

gameSchema.methods.current_mission = function() {
    return this.missions[this.mission_number];
};

gameSchema.methods.prev_mission = function() {
    return this.mission_number == 0 ? this.missions[0] : this.missions[this.mission_number - 1];
};

gameSchema.methods.next_mission = function() {
    return (this.mission_number == this.missions.length - 1) ? null : this.missions[this.mission_number + 1];
};

gameSchema.methods.current_team = function() {
    return this.current_mission().teams[this.current_mission().teams.length - 1];
};

gameSchema.methods.next_user = function(user) {
    var current_player = __.findIndex(this.players, function(obj) {
        return obj.user._id.equals(user._id);
    });
    return this.players[(current_player + 1) % this.players.length].user;
};

gameSchema.methods.create_team = function(leader) {
    this.current_mission().teams.push({
        leader: leader,
        members: [],
        votes: this.players.map(function(p) {
            return {
                user: p.user,
                vote: null
            };
        })
    });
};

gameSchema.methods.reset_team_votes = function() {
    this.current_team().votes.forEach(function(v) {
        v.vote = null;
    });
};

gameSchema.methods.approve_team = function() {
    this.current_mission().votes = this.current_team().members.map(function(u) {
        return {
            user: u,
            vote: null
        };
    });
};

gameSchema.methods.reject_team = function() {
    var next_leader = this.next_user(this.current_team().leader);
    this.create_team(next_leader);
};

gameSchema.methods.toggle_team_select = function(user_id) {
    var existing_team = this.current_team().members.slice(0);
    var index = __.findIndex(this.current_team().members, function (m) {
        return m._id.equals(user_id);
    });
    if (index > -1) {
        this.current_team().members.splice(index, 1);
    } else {
        this.current_team().members.push(user_id);
    }

    var remaining = this.current_mission().capacity - this.current_team().members.length;

    if (remaining < 0) {
        this.current_team().members = existing_team;
    } else {
        this.reset_team_votes();
    }
};

gameSchema.methods.toggle_team_vote = function(user_id, vote) {
    if (this.current_team().members.length == this.current_mission().capacity) {
        var current_vote = __.find(this.current_team().votes, function(v) {return v.user._id.equals(user_id)});
        if (current_vote.vote == vote) {
            current_vote.vote = null;
        } else {
            current_vote.vote = vote;
        }

        var vote_spread = __.groupBy(this.current_team().votes, function(v) {return v.vote});
        if (vote_spread[null] == null) {
            if ((vote_spread[true] || []).length > (vote_spread[false] || []).length) {
                this.approve_team();
            } else {
                this.reject_team();
            }
        }
    }
};

gameSchema.methods.toggle_mission_vote = function(user_id, vote) {
    var current_vote = __.find(this.current_mission().votes, function(v) {return v.user._id.equals(user_id)});
    if (current_vote) {
        if (current_vote.vote == vote) {
            current_vote.vote = null;
        } else {
            var player_faction = __.find(this.players, function(p) {return p.user._id.equals(user_id)}).role.faction;
            if (vote || player_faction == 'evil') {
                current_vote.vote = vote;
            }
        }
    }

    if (!__.some(this.current_mission().votes, function(v) {return v.vote == null})) {
        if (__.some(this.current_mission().votes, function(v) {return v.vote == false})) {
            this.current_mission().result = false;
        } else {
            this.current_mission().result = true;
        }
        if (this.mission_number + 1 < this.missions.length) {
            var next_leader = this.next_user(this.current_team().leader);
            this.mission_number += 1;
            this.create_team(next_leader);
        }
    }
};

gameSchema.methods.select_lady_target = function(user_id) {
    this.current_mission().lady.target = user_id;
    console.log(this.next_mission());
    if (this.next_mission()) {
        this.next_mission().lady.source = user_id;
    }
};

gameSchema.methods.valid_lady_targets = function() {
    var user = this.current_mission().lady.source;
    var previous_lady = this.prev_mission().lady.source;
    return __.pluck(this.players.filter(function(p){
        return !((user && p.user._id.equals(user._id)) || (previous_lady && p.user._id.equals(previous_lady._id)));
    }), 'user');
};

// Might be faster than inline methods?
var get_user_name = function(obj) {return obj.user.name};

gameSchema.methods.current_action = function() {
    var res = {
        action: 'none',
        action_text: '',
        remaining: []
    };

    // Catchall for all future mid-processing issues
    // If this is set to true, don't try to figure out *anything*
    // This should prevent accidental assassin reveals and any other issues

    if (this.action_sleep) {
        return res;
    }

    var logged_in = __.groupBy(this.players, function(p) {return p.logged_in});
    var lady_needed = this.current_mission().lady.source != null && this.current_mission().lady.target == null;
    var additions = this.current_mission().capacity - this.current_team().members.length;
    var team_vote = __.groupBy(this.current_team().votes, function(v) {return v.vote != null});
    var mission_vote = __.groupBy(this.current_mission().votes, function(v) {return v.vote != null});

    if (logged_in[false] != null) {
        res = {
            action: 'login',
            action_text: 'log in',
            remaining: logged_in[false].map(get_user_name)
        };
    } else if (lady_needed) {
        res = {
            action: 'lady',
            action_text: 'Lady someone',
            remaining: [this.current_mission().lady.source.name]
        };
    } else if (additions > 0) {
        res = {
            action: 'team_select',
            action_text: 'select ' + additions + ' more team member' + (additions > 1 ? 's' : ''),
            remaining: [this.current_team().leader.name]
        };
    } else if (team_vote[false] != null) {
        res = {
            action: 'team_vote',
            action_text: 'vote on the proposed team',
            remaining: team_vote[false].map(get_user_name)
        };
    } else if (mission_vote[false] != null) {
        res = {
            action: 'mission_vote',
            action_text: 'vote on the mission',
            remaining: mission_vote[false].map(get_user_name)
        };
    } else if (this.result == null) {
        // Ensure whether there's any further logic required here
        res = {
            action: 'unknown',
            action_text: '[do something to end the game]',
            remaining: ['someone']
        };
    }
    return res;
};

gameSchema.methods.revealed_info = function(user_id) {
    var self = this;
    var player = __.find(self.players, function(p) {return p.user._id.equals(user_id)});
    if (player) {
        var role = player.role;
        var revealed_role_ids = __.pluck(role.revealed_roles, '_id');
        var lady_users = __.pluck(
            __.pluck(self.missions, 'lady')
            .filter(function(l) {
                return l.source && l.target && l.source._id.equals(player.user._id)
            }), 'target')
        .map(function(u) {
            console.log('U:', u._id);
            var u_player = __.find(self.players, function(p) {
                console.log(p);
                return p.user._id.equals(u._id)
            });
            console.log(u_player);
            return {
                user: u,
                faction: u_player.role.faction
            };
        });
        var revealed_players = this.players.filter(function(p) {
            return __.some(revealed_role_ids, function(id) {return id.equals(p.role._id)});
        }).map(function(p) {
            return {
                user: p.user,
                faction: role.hidden_faction ? null : p.role.faction
            };
        });
        return {
            role: role,
            revealed_players: __.union(lady_users, revealed_players)
        }
    } else {
        return {
            role: {name: 'not playing'},
            revealed_players: []
        };
    }
};

gameSchema.methods.setup_game = function(user_ids, role_ids) {
    var self = this;
    self.action_sleep = false;
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
        var player = {
            user: user_ids[current_index],
            role: role_ids[current_index],
            logged_in: false
        };
        self.players.push(player);
    }
    var start_lady = self.players[self.players.length - 1].user;
    var lady_set = false;
    var ref_data = helpers.game_reference[user_ids.length];
    ref_data.missions.forEach(function(obj) {
        var lady_value = (obj.use_lady && !lady_set) ? start_lady : null;
        if (lady_value) {
            lady_set = true;
        }
        self.missions.push({
            result: null,
            capacity: obj.capacity,
            fails_needed: obj.fails_needed,
            lady: {source: lady_value, target: null},
            teams: [],
            votes: []
        });
    });
    self.create_team(self.players[0].user);
};

gameSchema.statics.findPopulated = function(filter, callback) {
    this.find(filter).deepPopulate(populate_string).exec(callback);
};

gameSchema.methods.addPopulations = function(cb) {
    this.deepPopulate(populate_string, cb);
};

gameSchema.methods.display_safe = function() {
    var self = this;

    return {
        result: self.result,
        mission_number: self.mission_number,
        missions: self.missions.map(function(m){
            var mission_votes = m.result == null ? [] : __.pluck(m.votes, 'vote');
            return {
                result: m.result,
                capacity: m.capacity,
                fails_needed: m.fails_needed,
                lady: m.lady,
                teams: m.teams.map(function(t){
                    var team_votes = __.some(t.votes, function(v) {return v.vote == null}) ? [] : t.votes;
                    return {
                        leader: t.leader,
                        members: t.members,
                        votes: team_votes
                    };
                }),
                votes: mission_votes
            };
        })
    };
};

var Game = mongoose.model('Game', gameSchema);

// make this available to our users in our Node applications
module.exports = Game;
