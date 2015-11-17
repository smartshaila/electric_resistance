// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    _id: mongoose.Schema.ObjectId,
    google_id: String,
    google_profile: {},
    name: String,
    created: Date
});

userSchema.statics.findOrCreate = function(queryObj, profile, done) {
    var self = this;
    this.findOne(queryObj, function(err, user) {
        if (err) {
            done(err, null);
        } else if (user != null) {
            console.log("Found User " + user.name);
            done(null, user);
        } else {
            var userObj = new self({
                _id: mongoose.Types.ObjectId(),
                google_id: profile.id,
                google_profile: profile._json,
                name: profile.displayName,
                created: Date.now()
            });
            userObj.save(function(err) {
                if (err) {
                    done(err, null);
                } else {
                    console.log("Saving user [" + userObj.name + "]");
                    done(null, userObj);
                }
            });
        }
    });
};
// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
