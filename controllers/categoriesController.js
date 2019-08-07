const institutes = require('../models/institutes')
const moment = require('moment')
const email_templates = require('../models/email_template.js')
const mongoose = require('mongoose')
const settings = require('../models/settings')
const institute_categories = require('../models/institute_categories');
const question_categories = mongoose.model("question_categories");
const instituteCategoriesModel = mongoose.model("institute_categories");
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
exports.update_category_data = async (req, res, next) => {
    try {
        let body = JSON.parse(JSON.stringify(req.body));
        console.log("body")
        console.log(body)
        let instituteId = mongoose.Types.ObjectId(req.body.instituteId);
        let organisationId = mongoose.Types.ObjectId(req.user.organisation_id);
        let categories = body.category_number
        let sub_categories = body.sub_category_number;

        let arrayFinal = [];

        for (let key in categories) {
            arrayFinal.push({
                category_id: mongoose.Types.ObjectId(key),
                number_of_question: parseInt(categories[key.toString()]),
                sub_category: [],
                organisation_id: organisationId,
                institute_id: instituteId
            });
        }
        for (let key in sub_categories) {
            let number = 0;

            let subcategoryData = [];
            for (let subkey in sub_categories[key]) {
                number = number + parseInt(sub_categories[key][subkey]);
                subcategoryData.push({
                    "number_of_question": parseInt(sub_categories[key][subkey]),
                    "sub_category_id": mongoose.Types.ObjectId(subkey),
                });
            }
            arrayFinal.push({
                category_id: mongoose.Types.ObjectId(key),
                number_of_question: number,
                sub_category: subcategoryData,
                organisation_id: organisationId,
                institute_id: instituteId
            });
        }
        console.log("arrayFinal");
        console.log(util.inspect(arrayFinal, { depth: null }));
        let deleteData = await instituteCategoriesModel.deleteMany({ institute_id: instituteId });
        let insertData = await instituteCategoriesModel.insertMany(arrayFinal);
        res.status(200).send({ status: 1, message: "success" });
    } catch (error) {
        console.log(error);
        res.status(400).send({ status: 1, message: error.message });
    }

}

exports.get_category_list = (req, res, next) => {
    new Promise((resolve, reject) => {
        let instituteId = mongoose.Types.ObjectId(req.query.i);

        question_categories.find({
            organisation_id: req.user.organisation_id,
            status: 1,
            is_deleted: 0
        }, { name: 1 }).then(async (data) => {
            let finalArray = [];
            let selectedCategories = await instituteCategoriesModel.find({ institute_id: instituteId, is_deleted: 0, status: 1 });
            if (selectedCategories.length > 0) {
                selectedCategories = selectedCategories.map(obj => obj.category_id.toString());
                data.forEach(obj => {
                    if (!selectedCategories.includes(obj._id.toString())) {
                        finalArray.push(obj);
                    }
                })
            } else {
                selectedCategories = [];
            }
            res.status(200).send({
                status: 1,
                data: finalArray
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