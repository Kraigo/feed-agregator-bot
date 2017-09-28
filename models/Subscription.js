const mongoose = require('mongoose');


var schema = new mongoose.Schema({
    chatId: Number,
    username: String
});


var Model = mongoose.model('Subscription', schema);

module.exports = Model;