const TelegramBot = require('node-telegram-bot-api');
const db = require('./config/db');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
const Subscription = require('./models/Subscription');
const Chat = require('./models/Chat');

bot.on('message', (msg) => {
    var chatId = msg.chat.id;
    var usernameMatch = msg.text.match(/@([\w\d]+)/i);
    var usernameInChat = usernameMatch ? usernameMatch[1] : null;

    if (msg.text.startsWith('/start')) {
        Chat.create({chatId: chatId, username: msg.chat.username});
    }

    else if (msg.text.startsWith('/subscribe')) {
        if (usernameInChat) {
            subscribe(chatId, usernameInChat);
        } else {
            saveAction(chatId, 'subscribe');
        }
    }
    else if (msg.text.startsWith('/unsubscribe')) {        
        if (usernameInChat) {
            unsubscribe(chatId, usernameInChat);          
        } else {            
            saveAction(chatId, 'unsubscribe');
        }
    }
    else if (msg.text.startsWith('/list')) {
        Subscription.find({chatId: chatId}).then(data => {
            let list = data.map(d => '@' + d.username).join('\r\n');
            list = list ? 'You subscribed to:\r\n' + list : 'No subscriptions';
            bot.sendMessage(chatId, list);
        })
    }
    else {
        if (usernameInChat) {
            Chat.findOne({chatId: chatId}).then((data) => {
                switch(data.action) {
                    case 'subscribe': return subscribe(chatId, usernameInChat);
                    case 'unsubscribe': return unsubscribe(chatId, usernameInChat);
                }
            }).then(() => {
                Chat.findOneAndUpdate({chatId: chatId}, {$set: {action: ''}});
            })
        }
    }
})

bot.on('channel_post', (post) => {
    const postId = post.chat.id;
    const messageId = post.message_id;

    Subscription.find({username: post.chat.username}).then(data => {
        data.reduce((queque, sub) =>
            queque = queque.then(() => 
                bot.forwardMessage(sub.chatId, postId, messageId)
            )
        , Promise.resolve());
    });
})

bot.on('inline_query', (query) => {
    
})

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
    return Subscription.findOneAndRemove({
        username: username
    })
    .then(() => {
        bot.sendMessage(chatId, 'Unsubscribed');
    });  
}

function saveAction(chatId, action) {
    return Chat.findOneAndUpdate({chatId: chatId}, {$set: {action: action}})
    .then(() => {
        bot.sendMessage(chatId, `Which channel do you want to ${action}?`);
    });
}