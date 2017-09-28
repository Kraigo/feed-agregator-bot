const mongoose = require('mongoose');
const appRoot = require('app-root-path');
const fs = require('fs');
mongoose.connect(process.env.MONGO_CONNECTION);

const db = mongoose.connection;

db.on('error', function (err) {
    // Обрабатываем ошибку
});
db.once('open', function callback() {
    // Соединение прошло успешно
});

function initModels() {
    let modelsPath = appRoot + '/models';
    fs.readdirSync(modelsPath)
        .forEach(function (file) {
            if (~file.indexOf('.js')) {
                require(modelsPath + '/' + file);
            }
        });
}

initModels();

module.exports = {
    db
}