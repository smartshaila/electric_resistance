var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
    console.log("Connected to db");
});

module.export = mongoose;
