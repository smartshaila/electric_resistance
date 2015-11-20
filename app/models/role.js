// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var roleSchema = new Schema({
    _id: mongoose.Schema.ObjectId,
    name: String,
    faction: String,
    default: Boolean,
    revealed_roles: [{type : mongoose.Schema.ObjectId, ref : 'Role'}],
    hidden_faction: Boolean
});

// the schema is useless so far
// we need to create a model using it
var Role = mongoose.model('Role', roleSchema);

// make this available to our users in our Node applications
module.exports = Role;
