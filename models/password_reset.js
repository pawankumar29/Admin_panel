// require mongoose module for mongoose connection
var mongoose = require('mongoose');
var password_reset = mongoose.model('password_reset');

exports.save = (content) => {
    return new Promise((resolve,reject) =>{
        var new_password_reset = new password_reset(content);
        new_password_reset.save(function (error, data) {
            if (!error) {
                resolve( {status: 1, message: 'success', data: data});
            } else {
                if (error.errors) {
                    console.log('error.errors');
                    console.log(error.errors);
                    resolve({status: 2, message: 'Invalid values'});
                } else {
                    resolve({status: 0, message: error.message});
                }
            }
        });
    });
};

exports.insert = (query) => {
    return new Promise((resolve, reject) => {
        // let new_password_resets = new password_reset(query);
        password_reset.insert(query, (error) => {
            if (error) {
                console.log("erooooooooooooo");
                reject(error);
            } else {
                resolve({ success: 1 });
            }
        });
    });
};

exports.findOne = (query) => {
    return new Promise((resolve, reject) => {
        password_reset.findOne(query, { __v: 0, updated_at: 0, created_at: 0 }, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });

    });
};

exports.remove = (query) => {
    return new Promise((resolve, reject) => {
        password_reset.remove(query, (error) => {
            if (error) {
                console.log("error in deletion");
                reject(error);
            } else {
                console.log("deleted");
                resolve({ status: 1, message: 'success' });
            }
        });
    });
};
