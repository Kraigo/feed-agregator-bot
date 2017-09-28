const express = require('express');
const bodyParser = require("body-parser");

const db = require('./config/db');
const bot = require('./config/bot');
const botHandler = require('./services/bot.handler');
const botActions = require('./services/bot.actions');

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(res, req) {
    res.send('App is working');
})

app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(port, "0.0.0.0", function() {
    console.log(`App listening on port ${port}!`);
});