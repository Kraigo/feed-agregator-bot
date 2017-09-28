const mongoose = require('mongoose');


var schema = new mongoose.Schema({
    chatId: Number,
    action: "String"
});


var Model = mongoose.model('Chat', schema);

module.exports = Model;