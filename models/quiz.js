"use strict";
const mongoose = require("mongoose");
const quiz = mongoose.model("quiz");

exports.update = (query, updatedata) => {
    return new Promise((resolve, reject) => {
        quiz.update(query, updatedata, {multi: true}, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};