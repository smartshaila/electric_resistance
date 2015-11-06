var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// Initialize express, socket.io, mongoose, and passport
var app = express();
var io = require('socket.io')();
app.io = io;
module.exports.io = io;
io.on('connection', require('../controllers/socket'));
var mongoose = require('./mongoose');
var passport = require('./passport');

// Initialize controllers
//var index = require('../controllers/index');

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Set various express helpers
app.use(favicon(path.join(__dirname, '../../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

// Session configuration
app.use(session(
    {
        secret: 'session_secret',
        saveUninitialized: false,
        resave: false,
        store: new MongoStore({ url: 'mongodb://localhost/test', touchAfter: 24 * 3600 })
    }
));
app.use(passport.initialize());
app.use(passport.session());

// GOOGLE AUTHENTICATION
// Maybe this can be extracted?
app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
    }
);

// Redirect for all non-authentication requests to the auth page
app.use(passport.ensureAuthenticated);

// Serve static content
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../bower_components')));

// Allow logging out
// Maybe have a landing page for different login types?
app.get('/logout', function(req, res) {
    console.log(req.session.passport.user.name + ' has logged out.');
    req.logout();
    res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
