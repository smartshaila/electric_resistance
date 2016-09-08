var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var Game = require('../models/game');
var Role = require('../models/role');
var User = require('../models/user');

// Initialize express, socket.io, mongoose, and passport
var app = express();
var io = require('socket.io')();
app.io = io;
module.exports.io = io;
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
    console.log("Connected to db");
});

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

app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../bower_components')));

// Session configuration
var sessionStore = new MongoStore({ url: 'mongodb://localhost/stuff', touchAfter: 24 * 3600 });
app.use(session(
    {
        secret: 'session_secret',
        saveUninitialized: false,
        resave: false,
        store: sessionStore
    }
));
app.use(passport.initialize());
app.use(passport.session());

// Expose Passport info to Sockets
var passportSocketIo = require('passport.socketio');
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'connect.sid',
    secret: 'session_secret',
    store: sessionStore
}));

// Import socket code/listeners
require('../controllers/socket')(io);

// GOOGLE AUTHENTICATION
// Maybe this can be extracted?
app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/'}),
    function (req, res) {
        console.log('Params', req.params);
        console.log('Query', req.query);
        res.redirect('/hall');
    }
);

// Facebook Authentication
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/'}),
    function (req, res) {
        console.log('Params', req.params);
        console.log('Query', req.query);
        res.redirect('/hall');
    }
);


// Redirect for all non-authentication requests to the auth page
app.use(passport.ensureAuthenticated);

// Serve static content

// Allow logging out
// Maybe have a landing page for different login types?
app.get('/logout', function(req, res) {
    console.log(req.session.passport.user.name + ' has logged out.');
    req.logout();
    res.redirect('/');
});

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/hall', function(req, res) {
    res.render('hall');
});

//app.get('/lobby', function(req, res, next) {
//    res.render('lobby');
//});

app.get('/lobby/:name', function(req , res){
    res.render('lobby', {room_name: req.params.name});
});

app.get('/game/:id', function(req, res) {
    res.render('game', {room_name: req.params.id});
});

//This is to test stuff...
//app.get('/newgame', function() {
//    var g = new Game({});
//    g.setup_game()
//});

app.get('/wipeusers', function(req, res) {
    User.remove({}, function(err) {
        console.log('All users removed');
    });
    res.redirect('/');
});

app.get('/wipegames', function(req, res) {
    Game.remove({}, function(err) {
        console.log('All games removed');
    });
    res.redirect('/');
});

app.get('/buildroles', function(req, res) {
    Role.remove({}, function(err) {
        console.log('collection removed');

        //Setting role ids ahead of time so that I can reference them in revealed roles

        var assassin_id = mongoose.Types.ObjectId();
        var morgana_id = mongoose.Types.ObjectId();
        var mordred_id = mongoose.Types.ObjectId();
        var oberon_id = mongoose.Types.ObjectId();
        var minion_id = mongoose.Types.ObjectId();
        var merlin_id = mongoose.Types.ObjectId();
        var percival_id = mongoose.Types.ObjectId();
        var loyal_id = mongoose.Types.ObjectId();

        var roles = [
            {_id: assassin_id, name: 'Assassin', faction: 'evil', default: false, revealed_roles: [assassin_id, morgana_id, mordred_id, minion_id]},
            {_id: morgana_id, name: 'Morgana', faction: 'evil', default: false, revealed_roles: [assassin_id, morgana_id, mordred_id, minion_id]},
            {_id: mordred_id, name: 'Mordred', faction: 'evil', default: false, revealed_roles: [assassin_id, morgana_id, mordred_id, minion_id]},
            {_id: oberon_id, name: 'Oberon', faction: 'evil', default: false, revealed_roles: []},
            {_id: minion_id, name: 'Minion of Mordred', faction: 'evil', default: true, revealed_roles: [assassin_id, morgana_id, mordred_id, minion_id]},
            {_id: merlin_id, name: 'Merlin', faction: 'good', default: false, revealed_roles: [assassin_id, morgana_id, minion_id, oberon_id]},
            {_id: percival_id, name: 'Percival', faction: 'good', default: false, revealed_roles: [merlin_id, morgana_id], hidden_faction: true},
            {_id: loyal_id, name: 'Loyal Servant of Arthur', faction: 'good', default: true, revealed_roles: []}
        ];

        roles.forEach(function(obj){
//            var id = roles.indexOf(obj);
            var r = new Role(obj);
            r.save(function (err){
                if (err) throw err;
                console.log(r.name, 'was created with', r._id);
            });
        });
    });
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
