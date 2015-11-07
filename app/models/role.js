// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var roleSchema = new Schema({
    _id: Number,
    name: String,
    faction: String,
    revealed_roles: [{type : mongoose.Schema.ObjectId, ref : 'Role'}]
});

// the schema is useless so far
// we need to create a model using it
var Role = mongoose.model('Role', roleSchema);

// make this available to our users in our Node applications
module.exports = Role;
