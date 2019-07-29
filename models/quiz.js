"use strict";
const mongoose = require("mongoose");
const quiz = mongoose.model("quizzezs");

exports.update = (query, updatedata) => {
    return new Promise((resolve, reject) => {
        quiz.update(query, updatedata, { multi: true }, (error, data) => {
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
        quiz.aggregate(query, (error, data) => {
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
        quiz.insertMany(data, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};