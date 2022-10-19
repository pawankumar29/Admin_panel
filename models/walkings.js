"use strict";
const mongoose = require("mongoose");
const walkings = mongoose.model("walkings");

exports.aggregate = (aggregate_query) => {
    return new Promise((resolve, reject) => {
        walkings.aggregate(aggregate_query, (error, data) => {
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
        walkings.count(query, (error, data) => {
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
        walkings.create(data, (error, data) => {
            if (error) {
                console.log("error")
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
exports.findOne = (query, projection) => {
    return new Promise((resolve, reject) => {
        walkings.findOne(query, projection, (error, data) => {
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
        walkings.updateOne(query, updatedata, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
exports.updateMany = (query, updatedata) => {
    return new Promise((resolve, reject) => {
        walkings.update(query, updatedata, {multi: true}, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};