const mongoose = require('mongoose');


var schema = new mongoose.Schema({
    username: String,
    lastMessage: Date
});


var Model = mongoose.model('Channel', schema);

module.exports = Model;