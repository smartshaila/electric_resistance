// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// For some reason Nick thought it would be a
// good idea to have missions defined for
// player counts that are illegal in the
// Resistance rules. So that's what the first five are.

var mission_capacities = [
    {missions: [{capacity: 1, fails_needed: 1}]},
    {missions: [{capacity: 1, fails_needed: 1}]},
    {missions: [{capacity: 1, fails_needed: 1}]},
    {missions: [
        {capacity: 1, fails_needed: 1},
        {capacity: 2, fails_needed: 1}
    ]},
    {missions: [
        {capacity: 2, fails_needed: 1},
        {capacity: 2, fails_needed: 1},
        {capacity: 3, fails_needed: 1}
    ]},
    {missions: [
        {capacity: 2, fails_needed: 1},
        {capacity: 3, fails_needed: 1},
        {capacity: 2, fails_needed: 1},
        {capacity: 3, fails_needed: 1},
        {capacity: 3, fails_needed: 1}
    ]},
    {missions: [
        {capacity: 2, fails_needed: 1},
        {capacity: 3, fails_needed: 1},
        {capacity: 4, fails_needed: 1},
        {capacity: 3, fails_needed: 1},
        {capacity: 4, fails_needed: 1}
    ]},
    {missions: [
        {capacity: 2, fails_needed: 1},
        {capacity: 3, fails_needed: 1},
        {capacity: 3, fails_needed: 1},
        {capacity: 4, fails_needed: 2},
        {capacity: 4, fails_needed: 1}
    ]},
    {missions: [
        {capacity: 3, fails_needed: 1},
        {capacity: 4, fails_needed: 1},
        {capacity: 4, fails_needed: 1},
        {capacity: 5, fails_needed: 2},
        {capacity: 5, fails_needed: 1}
    ]},
    {missions: [
        {capacity: 3, fails_needed: 1},
        {capacity: 4, fails_needed: 1},
        {capacity: 4, fails_needed: 1},
        {capacity: 5, fails_needed: 2},
        {capacity: 5, fails_needed: 1}
    ]},
    {missions: [
        {capacity: 3, fails_needed: 1},
        {capacity: 4, fails_needed: 1},
        {capacity: 4, fails_needed: 1},
        {capacity: 5, fails_needed: 2},
        {capacity: 5, fails_needed: 1}
    ]}
];

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

// the schema is useless so far
// we need to create a model using it
var Game = mongoose.model('Game', gameSchema);

// make this available to our users in our Node applications
module.exports = Game;
