"use strict";
const mongoose = require("mongoose");
const walking_categories = mongoose.model("walking_categories");

exports.update = (query, updatedata) => {
    return new Promise((resolve, reject) => {
        walking_categories.updateOne(query, updatedata, {multi: true}, (error, data) => {
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
        walking_categories.insertMany(data, (error, data) => {
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
        walking_categories.aggregate(query, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};