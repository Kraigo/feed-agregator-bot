const TelegramBot = require('node-telegram-bot-api');
var bot;

if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    bot.setWebHook(`${process.env.SITE_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`);
} else {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
}

module.exports = bot;