const appRoot = require('app-root-path');
const bot = require(appRoot + '/config/bot');
const Subscription = require(appRoot + '/models/Subscription');
const Chat = require(appRoot + '/models/Chat');
const Channel = require(appRoot + '/models/Channel');
const botActions = require(appRoot + '/services/bot.actions');


bot.on('message', (msg) => {
    var chatId = msg.chat.id;
    var usernameMatch = msg.text.match(/@([\w\d]+)/i);
    var usernameInChat = usernameMatch ? usernameMatch[1] : null;

    if (msg.text.startsWith('/start')) {
        Chat.create({chatId: chatId, username: msg.chat.username});
    }

    else if (msg.text.startsWith('/subscribe')) {
        if (usernameInChat) {
            botActions.subscribe(chatId, usernameInChat);
        } else {
            botActions.saveAction(chatId, 'subscribe');
        }
    }
    else if (msg.text.startsWith('/unsubscribe')) {        
        if (usernameInChat) {
            botActions.unsubscribe(chatId, usernameInChat);          
        } else {            
            botActions.saveAction(chatId, 'unsubscribe');
        }
    }
    else if (msg.text.startsWith('/list')) {
        Subscription.find({chatId: chatId}).then(data => {
            let list = data.map(d => '@' + d.username).join('\r\n');
            list = list ? 'You are subscribed to:\r\n' + list : 'No subscriptions';
            bot.sendMessage(chatId, list);
        })
    }
    else if (msg.text.startsWith('/help')) {
        bot.sendMessage(chatId, 'You can subscribe to a channels and receive all updates at once.\r\nFor that you need to add Me into channel as administarator and write /subscribe @channel');
    }
    else {
        if (usernameInChat) {
            Chat.findOne({chatId: chatId}).then((data) => {
                switch(data.action) {
                    case 'subscribe':
                        return botActions.subscribe(chatId, usernameInChat);
                    case 'unsubscribe':
                        return botActions.unsubscribe(chatId, usernameInChat);
                }
            }).then(() => {
                Chat.findOneAndUpdate({chatId: chatId}, {action: null}).exec();
            })
        }
    }
})

bot.on('channel_post', (post) => {
    botActions.forwardPost(post);
    Channel.findOneAndUpdate(
        {username: post.chat.username}, 
        {username: post.chat.username, lastMessage: new Date()},
        {upsert: true, new: true, setDefaultsOnInsert: true})
        .exec();
})