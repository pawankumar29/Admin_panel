"use strict";
const mongoose = require("mongoose");
const institute_categories = mongoose.model("institute_categories");

exports.update = (query, updatedata) => {
    return new Promise((resolve, reject) => {
        institute_categories.update(query, updatedata, {multi: true}, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
exports.insertMany = (data) => {
    return new Promise((resolve, reject) => {
        institute_categories.insertMany(data, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
exports.aggregate = (query) => {
    return new Promise((resolve, reject) => {
        institute_categories.aggregate(query, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};