// require mongoose module for mongoose connection
var mongoose = require('mongoose');
var email_template = mongoose.model('email_template');

exports.findOne = (query) => {
    return new Promise((resolve, reject) => {
        email_template.findOne(query, {__v: 0, updated_at: 0, created_at: 0}, (error, data) => {
            if (!error) {
                if (data !== null) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve({status: 1, message: 'success', data: data});
                } else {
                    resolve({status: 2, message: 'template not found'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.find_with_pagination = (query, sort_condition, skip, limit, options) => {
    return new Promise((resolve, reject) => {
        email_template.find(query).sort(sort_condition)
                .skip(skip).limit(limit).paginate(options, (error, data) => {
            if (!error) {
                if (data.length !== 0) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve({status: 1, message: 'success', data: data});
                } else {
                    resolve({status: 2, message: 'email_template not found'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};


exports.save = (data) => {
    return new Promise((resolve, reject) => {
        var new_email_template = new email_template(data);
        new_email_template.save(function (error, data) {
            if (!error) {
                resolve({status: 1, message: 'success', data: data});
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
exports.update = (query, update_data) => {
    return new Promise((resolve, reject) => {
        email_template.update(query, update_data, {multi: true}, (error, data) => {
            if (!error) {
                if (data.nModified > 0) {
                    resolve({status: 1, message: "success"});
                } else {
                    resolve({status: 0, message: "Users data could not update"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};