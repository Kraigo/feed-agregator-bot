const appRoot = require('app-root-path');
const bot = require(appRoot + '/config/bot');
const Subscription = require(appRoot + '/models/Subscription');
const Chat = require(appRoot + '/models/Chat');

module.exports = {
    subscribe,
    unsubscribe,
    saveAction,
    forwardPost
}

function subscribe(chatId, username) {
    return Subscription.find({chatId, username})
        .then(data => {
            if (data.length) {
                bot.sendMessage(chatId, 'You already subscribed');
            } else {
                return Subscription.create({
                    chatId: chatId,
                    username: username
                })
                .then(() => {
                    bot.sendMessage(chatId, 'Subscription added');
                });
            }
        })   
}

function unsubscribe(chatId, username) {
    return Subscription.find({chatId, username})
        .then(data => {
            if (data.length) {
                bot.sendMessage(chatId, 'You are not subscribed')
            } else {
                Subscription.findOneAndRemove({
                    username: username
                })
                .then(() => {
                    bot.sendMessage(chatId, 'Subscription removed');
                }); 
            }
        })
}

function saveAction(chatId, action) {
    return Chat.findOneAndUpdate({chatId: chatId}, {$set: {action: action}})
    .then(() => {
        bot.sendMessage(chatId, `Which channel do you want to ${action}?`);
    });
}

function forwardPost(post) {    
    const username = post.chat.username;
    const postId = post.chat.id;
    const messageId = post.message_id;

    return Subscription.find({username: username}).then(data => {
        return data.reduce((queque, sub) =>
            queque = queque.then(() => 
                bot.forwardMessage(sub.chatId, postId, messageId)
            )
        , Promise.resolve());
    });
}