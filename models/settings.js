// require mongoose module for mongoose connection
const mongoose = require('mongoose');
const settings = mongoose.model('settings'); //model for user data

exports.findOnePromise = function (query) {
    return new Promise((resolve, reject) => {
        settings.findOne(query, function (error, data) {
            if (!error) {
                resolve(data);
            } else {
                reject(error);
            }
        });
    });
}
    