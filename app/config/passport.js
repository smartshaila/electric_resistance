var passport = require('passport');
//var app = require('./express');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');

var GAPPS_CLIENT_ID = process.env.GAPPS_CLIENT_ID || '';
var GAPPS_CLIENT_SECRET = process.env.GAPPS_CLIENT_SECRET || '';

passport.serializeUser(function (user, done) {
    done(null, user.google_id);
});

passport.deserializeUser(function (user, done) {
    done(null, User.find({ google_id: user}));
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
    if (req.path == '/auth/google' || req.path == '/auth/google/callback' || req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/google');
};

module.exports = passport;
