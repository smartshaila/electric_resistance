// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    google_id: String,
    google_profile: Mixed,
    name: String,
    created: Date
});

//userSchema.statics.findOrCreate = function(queryObj, createObj) {
//
//};
// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;