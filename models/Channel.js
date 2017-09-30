const mongoose = require('mongoose');


var schema = new mongoose.Schema({
    username: String,
    lastMessage: Date,
    title: String,
    inviteLink: String
});


var Model = mongoose.model('Channel', schema);

module.exports = Model;