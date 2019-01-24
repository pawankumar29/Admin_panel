"use strict";
const mongoose = require("mongoose");
const quiz_results = mongoose.model("quiz_result");

exports.update = (query, updatedata) => {
    return new Promise((resolve, reject) => {
        quiz_results.update(query, updatedata, {multi: true}, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};