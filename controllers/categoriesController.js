const institutes = require('../models/institutes')
const moment = require('moment')
const email_templates = require('../models/email_template.js')
const mongoose = require('mongoose')
const settings = require('../models/settings')
const institute_categories = require('../models/institute_categories');
const question_categories = mongoose.model("question_categories");
const swig = require('swig');
var util = require("util");
exports.get_categories = (req, res, next) => {
    try {
        let aggregation = [{
                $match: {
                    organisation_id: req.user.organisation_id,
                    institute_id: mongoose.Types.ObjectId(req.params.id),
                    status: 1,
                    is_deleted: 0
                }
            }];
        let p1 = institute_categories.aggregate(aggregation);
        let p2 = question_categories.find({
            organisation_id: req.user.organisation_id,
            status: 1,
            is_deleted: 0
        }, {
            category: 1,
            name: 1,
            sub_category: 1
        });
        
        Promise.all([p1, p2]).then(([data, categoryData]) => {
//            console.log("categories data");
//            console.log(util.inspect(data, {
//                depth: null
//            }));
//            console.log("raw categories");
//            console.log(util.inspect(categoryData, {
//                depth: null
//            }));
            res.render('institute/categories', {
                title: 'Manage Categories',
                active: 'manage_institutions_page',
                categories: data,
                id: req.params.id,
                message: req.flash(),
                raw_categories: categoryData
            })
        }).catch(error => {
            console.log(error);
        })
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
};

exports.get_category_data = (req, res, next) => {
    new Promise((resolve, reject) => {
        console.log(req.body);
        question_categories.findOne({
            _id: mongoose.Types.ObjectId(req.body.category_id),
            organisation_id: req.user.organisation_id,
            status: 1,
            is_deleted: 0
        }).then(data => {
            res.status(200).send({
                status: 1,
                data: data
            });
        }).catch(error => {
            reject(error);
        })
    }).catch(err => {
        res.status(400).send({
            status: 0,
            message: err.message
        });
    });
}
exports.update_category_data = (req, res, next) => {
    console.log(req.body);
//    new Promise((resolve, reject) => {
//        console.log(req.body);
//        question_categories.findOne({
//            _id: mongoose.Types.ObjectId(req.body.category_id),
//            organisation_id: req.user.organisation_id,
//            status: 1,
//            is_deleted: 0
//        }).then(data => {
//            res.status(200).send({
//                status: 1,
//                data: data
//            });
//        }).catch(error => {
//            reject(error);
//        })
//    }).catch(err => {
//        res.status(400).send({
//            status: 0,
//            message: err.message
//        });
//    });
}

exports.get_category_list = (req, res, next) => {
    new Promise((resolve, reject) => {
        console.log(req.body);
        question_categories.find({
            organisation_id: req.user.organisation_id,
            status: 1,
            is_deleted: 0
        }, {name: 1}).then(data => {
            console.log(data);
            res.status(200).send({
                status: 1,
                data: data
            });
        }).catch(error => {
            reject(error);
        })
    }).catch(err => {
        console.log(err);
        res.status(400).send({
            status: 0,
            message: err.message
        });
    });
}