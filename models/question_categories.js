"use strict";
const mongoose = require("mongoose");
const question_categories = mongoose.model("question_categories");

exports.count = (query) => {
    return new Promise((resolve, reject) => {
        question_categories.count(query, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
exports.findOne = (query) => {
    return new Promise((resolve, reject) => {
        question_categories.findOne(query, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
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
exports.save = (data) => {
    return new Promise((resolve, reject) => {
        question_categories.create(data, (error, data) => {
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
        question_categories.updateMany(query, updatedata, {multi: true}, (error, data) => {
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