"use strict";
const mongoose = require("mongoose");
const institutes = mongoose.model("institutes");

exports.aggregate = (aggregate_query) => {
    return new Promise((resolve, reject) => {
        institutes.aggregate(aggregate_query, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};

exports.count = (query) => {
    return new Promise((resolve, reject) => {
        institutes.count(query, (error, data) => {
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
        institutes.create(data, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};