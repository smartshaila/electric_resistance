var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var util = require('util');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function callback() {
    console.log("Connected to db");
});

var User = require('./models/user');

User.find({}, function(err, users) {
    if (err) throw err;
    console.log(users);
});

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var GAPPS_CLIENT_ID = process.env.GAPPS_CLIENT_ID || '';
var GAPPS_CLIENT_SECRET = process.env.GAPPS_CLIENT_SECRET || '';

console.log(GAPPS_CLIENT_ID);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Socket.io

var socket_io = require( "socket.io" );
var io = socket_io();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', routes);
app.use('/users', users);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: GAPPS_CLIENT_ID,
        clientSecret: GAPPS_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ google_id: profile.id }, function(err, user) {
            if(err) { console.log(err); }
            if (!err && user != null) {
                console.log(user);
                done(null, user);
            } else {
                var userObj = new User({
                    google_id: profile.id,
                    google_profile: profile,
                    name: profile.displayName,
                    created: Date.now()
                });
                userObj.save(function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("Saving user ...");
                        done(null, user);
                    }
                });
            }
        });
    }
));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
// Successful authentication, redirect home.
      res.redirect('/');
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
module.exports.io = io;

io.on('connection', require('./routes/socket'));