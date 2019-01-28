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
            }
            // {
            //     "$lookup": {
            //         from: "question_categories",
            //         let: {
            //             ref_id: "$category_id"
            //         },
            //         pipeline: [{
            //                 $match: {
            //                     $expr: {
            //                         $and: [{
            //                                 $eq: ["$organisation_id", req.user.organisation_id]
            //                             },
            //                             {
            //                                 $eq: ["$_id", "$$ref_id"]
            //                             },
            //                             {
            //                                 $eq: ["$status", 1]
            //                             },
            //                             {
            //                                 $eq: ["$is_deleted", 0]
            //                             }
            //                         ]
            //                     }
            //                 }
            //             },
            //             {
            //                 "$project": {
            //                     name: 1
            //                 }
            //             }
            //         ],
            //         as: "category_data"
            //     }
            // },
            // {
            //     "$unwind": "$category_data"
            // },
            // {
            //     "$project": {
            //         _id: "$category_data._id",
            //         name: "$category_data.name",
            //         sub_category: "$sub_category",
            //         number_of_question: "$number_of_question"
            //     }
            // },
            // {
            //     "$unwind": {
            //         path: "$sub_category",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            // {
            //     "$lookup": {
            //         from: "question_categories",
            //         let: {
            //             ref_id: "$_id",
            //             sub_category_id: "$sub_category.sub_category_id"
            //         },
            //         pipeline: [{
            //                 $match: {
            //                     $expr: {
            //                         $and: [{
            //                                 $eq: ["$organisation_id", req.user.organisation_id]
            //                             },
            //                             {
            //                                 $eq: ["$_id", "$$ref_id"]
            //                             },
            //                             {
            //                                 $eq: ["$status", 1]
            //                             },
            //                             {
            //                                 $eq: ["$is_deleted", 0]
            //                             }
            //                         ]
            //                     }
            //                 }
            //             },
            //             {
            //                 "$unwind": "$sub_category"
            //             },
            //             {
            //                 $match: {
            //                     $expr: {
            //                         $and: [{
            //                                 $eq: ["$sub_category._id", "$$sub_category_id"]
            //                             },
            //                             {
            //                                 $eq: ["$status", 1]
            //                             },
            //                             {
            //                                 $eq: ["$is_deleted", 0]
            //                             }
            //                         ]
            //                     }
            //                 }
            //             },
            //             {
            //                 "$project": {
            //                     name: "$sub_category.name",
            //                     _id: "$sub_category._id"
            //                 }
            //             }
            //         ],
            //         as: "sub_category_data"
            //     }
            // },
            // {
            //     "$unwind": {
            //         path: "$sub_category_data",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            // {
            //     "$group": {
            //         _id: "$_id",
            //         name: {
            //             "$first": "$name"
            //         },
            //         number_of_question: {
            //             "$first": "$number_of_question"
            //         },
            //         sub_category: {
            //             $push: {
            //                 _id: "$sub_category_data._id",
            //                 name: "$sub_category_data.name",
            //                 number_of_question: "$sub_category.number_of_question"
            //             }
            //         }
            //     }
            // },
            // {
            //     "$project": {
            //         "sub_category": {
            //             $setDifference: ["$sub_category", [{}]]
            //         },
            //         name: 1,
            //         number_of_question: 1
            //     }
            // }
        ];

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
            console.log("categories data");
            console.log(util.inspect(data, {
                depth: null
            }));
            console.log("raw categories");
            console.log(util.inspect(categoryData, {
                depth: null
            }));
//            categoryData = categoryData.map(obj => {
//                for (i = 0; i < data.length; i++) {
//                    if (data[i]["category_id"].toString() === obj["_id"].toString()) {
//                        obj["select"] = 1;
//                        obj["number_of_question"] = data[i]["number_of_question"]
//                        if (obj["sub_category"].length > 0) {
//                            let sub_category = [];
//                            obj["sub_category"].map(subCategory => {
//                                let number_of_question;
//                                for (j = 0; j < data[i]["sub_category"]; j++) {
//                                    if (subCategory["_id"].toString() == data[i]["sub_category"]["sub_category_id"].toString()) {
//                                        subCategory["select"] = 1;
//                                        number_of_question = data[i]["sub_category"]["number_of_question"]
//                                    } else {
//                                        subCategory["select"] = 0;
//                                    }
//                                }
//                            });
//                        }
//                    } else {
//                        obj["select"] = 0;
//                    }
//                }
//            });
            res.render('institute/categories', {
                title: 'Manage Categories',
                active: 'manage_institutions_page',
                categories: data,
                id: data.id,
                message: req.flash(),
                raw_categories: categoryData
            })
        }).catch(error => {
            console.log(error);
        })
        // render view add institution page
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
};