"use strict";
const mongoose = require("mongoose");
const question_categories = mongoose.model("question_categories");

exports.find = (query) => {
    return new Promise((resolve, reject) => {
        question_categories.find(query, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
exports.update = (query, updatedata) => {
    return new Promise((resolve, reject) => {
        question_categories.update(query, updatedata, {multi: true}, (error, data) => {
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
        question_categories.aggregate(query, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};