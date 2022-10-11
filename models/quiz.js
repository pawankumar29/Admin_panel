"use strict";
const mongoose = require("mongoose");
const quiz = mongoose.model("quizzezs");

exports.update = (query, updatedata) => {
    return new Promise((resolve, reject) => {
        quiz.updateOne(query, updatedata, { multi: true }, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
        });
    });
};
exports.delete = async(id,deleteData) => {
    console.log(id,deleteData,"=================")
        const result=await quiz.updateOne(id, deleteData)
        console.log(result,"tttttttttttttttttttttttt")
        return result
        }
exports.findOne = (query) => {
    return new Promise((resolve, reject) => {
        quiz.findOne(query, (error, data) => {
        
            if (error) {
                console.log(error)
                reject(error)
            } else {
                console.log(data,"datttttttttttt")
                resolve(data);
            }
        });
    });
};
exports.count = (query) => {
    return new Promise((resolve, reject) => {
        quiz.count(query, (error, data) => {
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