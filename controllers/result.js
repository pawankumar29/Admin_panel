const institutes = require('../models/institutes')
const moment = require('moment')
const email_templates = require('../models/email_template.js')
const mongoose = require('mongoose')
const users = require("../models/user");
const settings = require('../models/settings')
var multer = require('multer');
var util = require('util');
var fs = require('fs')
var csv = require('fast-csv');
const roles = require("../helper/roles");
const quizzes = require("../models/quiz")
const quiz_results = require("../models/quiz_result")
const institute_categories = require("../models/institute_categories")
const question_categories = require("../models/question_categories")

exports.get_quiz = async(req, res, next) => {
    try {
        let condition = {
            organisation_id: mongoose.Types.ObjectId(req.user.organisation_id),
            is_deleted: 0,
            is_walkin: 0
        }

        let aggregation_query = [
            { $match: condition },
            { $sort: { start_time: -1 } },
            {
                $lookup: {
                    from: 'institutes',
                    let: { ref_id: '$institute_id' },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$ref_id'] },
                                        { $eq: ['$organisation_id', req.user.organisation_id] },
                                        { $eq: ['$is_deleted', 0] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                qualification: 1,
                                po_name: 1
                            }
                        }
                    ],
                    as: 'institute'
                }
            },
            { $unwind: "$institute" },
            {
                $sort: {
                    start_time: -1
                }
            }
        ];
        let result = await quizzes.aggregate(aggregation_query);
        res.render('result/list', {
            response: result,
            // count: count,
            // prev: parseInt(options.page - 1 < 1 ? 1 : options.page - 1),
            // last: last,
            // pages: pages,
            // next: options.page == last ? last : last + 1,
            // message: req.flash(),
            // options: options,
            // current: req.query.page || 1,
            // delta: global.config.delta,
            title: 'Results',
            active: 'result_page'
        })

    } catch (err) {
        console.log(err);
        res.redirect('/dashboard');
    }
}
exports.get_quiz_result = async(req, res, next) => {
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
        var condition = {
            organisation_id: req.user.organisation_id,
            institute_id: mongoose.Types.ObjectId(req.query.i),
            quiz_id: mongoose.Types.ObjectId(req.query.q),
            is_deleted: 0
        };
        var user_lookup = {
            from: 'users',
            let: {
                ref_id: '$user_id'
            },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$ref_id'] } } }, { $project: { _id: 1, name: 1, roll_no: 1, qualification: 1 } }],
            as: 'user_detail'
        };

        let p1 = quiz_results.count(condition);
        /** ***skip check*****/
        let skipPages = options.page - 1
        let aggregation_query = [{
                    $match: condition
                },
                {
                    $sort: {
                        created_at: -1
                    }
                },
                // {
                //     $skip: skipPages * global.config.pagination_limit
                // },
                // {
                //     $limit: global.config.pagination_limit
                // },
                {
                    $lookup: user_lookup
                },
                {
                    $unwind: {
                        path: '$user_detail',
                        preserveNullAndEmptyArrays: true
                    }
                },
            ]
            // console.log(util.inspect(aggregation_query, { depth: null }));
        let p2 = quiz_results.aggregate(aggregation_query)
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
                // console.log(util.inspect(result, { depth: null }));
                if (req.query.page) {
                    res.render('result/student_list', {
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
                        title: 'Results',
                        active: 'result_page',
                        institute_id: req.params.inst_id
                    })
                } else {
                    res.render('result/student_list', {
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
                        title: 'Results',
                        active: 'result_page',
                        institute_id: req.params.inst_id

                    })
                }
            })
            .catch(error => {
                reject(error)
            })
    }).catch(err => {
        console.log(err)
        res.redirect('/result');
    })
}