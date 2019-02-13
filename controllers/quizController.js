const institutes = require('../models/institutes')
const moment = require('moment')
// const mails = require('../helper/send_mail.js');
// const email = require('../email_template_cms_pages');
const email_templates = require('../models/email_template.js')
const mongoose = require('mongoose')
const users = require("../models/user");
const settings = require('../models/settings')
var util = require('util');
const quizzes = require("../models/quiz")
const quiz_results = require("../models/quiz_result")
const institute_categories = require("../models/institute_categories")
const question_categories = require("../models/question_categories")

exports.get_categoriesList = (req, res, next) => {
    new Promise((resolve, reject) => {
        // make global variable options for paginate method parameter
        let options = {
            perPage: global.config.pagination_limit,
            delta: global.config.delta,
            page: 1
        }
        if (req.query.page) {
            options.page = req.query.page
        }
        /** ***skip check*****/
        let skipPages = options.page - 1
        let startOfYear = new Date(moment.utc().startOf('year'))
        let aggregation_query = [{
                $match: {
                    organisation_id: req.user.organisation_id,
                    is_deleted: 0
                }
            },
            {
                $sort: {
                    name: 1
                }
            },
            {
                $skip: skipPages * global.config.pagination_limit
            },
            {
                $limit: global.config.pagination_limit
            },
//            {
//                $unwind: {
//                    path: '$sub_category',
//                    preserveNullAndEmptyArrays: true
//                }
//            }
        ];
        let p1 = question_categories.count({
            organisation_id: req.user.organisation_id,
            is_deleted: 0
        })
        let p2 = question_categories.aggregate(aggregation_query)
        Promise.all([p1, p2])
                .then(([count, result]) => {
                    let last = parseInt(
                            count % global.config.pagination_limit == 0 ?
                            count / global.config.pagination_limit :
                            count / global.config.pagination_limit + 1
                            )
                    let pages = []
                    for (i = 1; i <= last; i++) {
                        pages.push(i)
                    }
                    if (req.query.page) {
                        res.render('quiz/table', {
                            response: result,
                            count: count,
                            prev: parseInt(options.page - 1 < 1 ? 1 : options.page - 1),
                            last: last,
                            pages: pages,
                            next: options.page == last ? last : last + 1,
                            message: req.flash(),
                            options: options,
                            current: req.query.page || 1,
                            delta: global.config.delta,
                            title: 'Manage Quiz',
                            active: 'manage_quiz_page'
                        })
                    } else {
                        res.render('quiz/categoriesList', {
                            response: result,
                            count: count,
                            prev: parseInt(options.page - 1 < 1 ? 1 : options.page - 1),
                            last: last,
                            pages: pages,
                            next: options.page == last ? last : last + 1,
                            message: req.flash(),
                            options: options,
                            current: req.query.page || 1,
                            delta: global.config.delta,
                            title: 'Manage Quiz',
                            active: 'manage_quiz_page'
                        })
                }
                })
                .catch(error => {
                    reject(error)
                })
    }).catch(err => {
        console.log(err)
        //        res.redirect('/institutes');
    })
}
exports.add_category = (req, res, next) => {
    try {
        settings
                .findOnePromise({}, {
                    qualification: 1
                })
                .then(data => {
                    res.render('quiz/add', {
                        title: 'Add Category',
                        active: 'manage_quiz_page',
//                        qualification: data.qualification,
                        message: req.flash()
                    })
                })
                .catch(error => {
                    reject(error)
                })
        // render view add institution page
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
}
exports.save_new_category = (req, res, next) => {
    try {
        var sub_category = [];
        if (req.body.category_type == '1') {
            if (typeof (req.body.sub_category) == 'string') {
                sub_category = [{name:req.body.sub_category}]
            } else {
                for(var i=0;i<req.body.sub_category.length;i++){
                    sub_category.push({name:req.body.sub_category[i]});
                }
            }

        }

        var data = {
            organisation_id: req.user.organisation_id,
            name: req.body.name,
            sub_category: sub_category
        }
        question_categories.save(data).then(response => {
            res.redirect('/quiz');
        }).catch(err => {
            res.render('error', {
                error: err
            })
        })
//        settings
//                .findOnePromise({}, {
//                    qualification: 1
//                })
//                .then(data => {
//                    res.render('quiz/add', {
//                        title: 'Add Category',
//                        active: 'manage_quiz_page',
////                        qualification: data.qualification,
//                        message: req.flash()
//                    })
//                })
//                .catch(error => {
//                    reject(error)
//                })
        // render view add institution page
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
}