"use strict";
const mongoose = require("mongoose");
const questions = mongoose.model("questions");

exports.insertMany = (data) => {
    return new Promise((resolve, reject) => {
        questions.insertMany(data, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
exports.find = (data) => {
    return new Promise((resolve, reject) => {
        questions.find(data, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};

exports.findOne = (data) => {
    return new Promise((resolve, reject) => {
        questions.findOne(data, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};