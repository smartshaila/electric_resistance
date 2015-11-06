var passport = require('passport');
//var app = require('./express');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');

var GAPPS_CLIENT_ID = process.env.GAPPS_CLIENT_ID || '';
var GAPPS_CLIENT_SECRET = process.env.GAPPS_CLIENT_SECRET || '';

passport.serializeUser(function (user, done) {
//    console.log('Serialize: ' + user)
    done(null, user.google_id);
//    done(null, user);
});

passport.deserializeUser(function (google_id, done) {
//    console.log('Deserialize: ' + google_id);
    User.findOne({ google_id: google_id }, function(err, user) {
//        console.log('Found: ' + user.name);
        done(err, user);
    });
//    done(null, user);
});

passport.use(new GoogleStrategy({
        clientID: GAPPS_CLIENT_ID,
        clientSecret: GAPPS_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        User.findOrCreate({ google_id: profile.id }, profile, done);
    }
));

passport.ensureAuthenticated = function(req, res, next) {
    if (req.path.indexOf('/auth') != -1 || req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/google');
};

module.exports = passport;
