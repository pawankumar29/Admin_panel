"use strict";
const mongoose = require("mongoose");
const quiz_results = mongoose.model("quiz_results");

exports.count = (query) => {
  return new Promise((resolve, reject) => {
    quiz_results.count(query, (error, data) => {
      if (error) {
        reject(error);
      } else {
        //console.log(data)
        resolve(data);
      }
    });
  });
};
exports.update = (query, updatedata) => {
  return new Promise((resolve, reject) => {
    quiz_results.updateOne(query, updatedata, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};
exports.aggregate = (aggregate_query) => {
  return new Promise((resolve, reject) => {
    quiz_results.aggregate(aggregate_query, (error, data) => {
      if (error) {
        reject(error);
      } else {
        //console.log(data)
        resolve(data);
      }
    });
  });
};
exports.module = async (query) => {
  try {
    const question_categories = await question_categories.find(query);
    return question_categories;
  } catch (err) {
    console.log(err);
  }
};
