var passport = require('passport');
//var app = require('./express');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');

var GAPPS_CLIENT_ID = process.env.GAPPS_CLIENT_ID || '';
var GAPPS_CLIENT_SECRET = process.env.GAPPS_CLIENT_SECRET || '';
var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
var CALLBACK_ROOT = process.env.CALLBACK_ROOT || 'http://localhost:3000';

passport.serializeUser(function (user, done) {
//    console.log('Serialize: ' + user)
    done(null, user._id);
//    done(null, user);
});

passport.deserializeUser(function (_id, done) {
//    console.log('Deserialize: ' + google_id);
    User.findOne({ _id: _id }, function(err, user) {
//        console.log('Found: ' + user.name);
        done(err, user);
    });
//    done(null, user);
});

passport.use(new GoogleStrategy({
        clientID: GAPPS_CLIENT_ID,
        clientSecret: GAPPS_CLIENT_SECRET,
        callbackURL: CALLBACK_ROOT + "/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        User.findOrCreate({ google_id: profile.id }, profile, done);
    }
));

passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: CALLBACK_ROOT + "/auth/facebook/callback",
        enableProof: false
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ facebook_id: profile.id }, profile, done);
    }
));

passport.ensureAuthenticated = function(req, res, next) {
    console.log(req.path);
    if (req.path == '/' || req.path.indexOf('/auth') != -1 || req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

module.exports = passport;
