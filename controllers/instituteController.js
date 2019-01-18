const institutes = require("../models/institutes");
const moment = require('moment');
//const mails = require('../helper/send_mail.js');
//const email = require('../email_template_cms_pages');
const email_templates = require('../models/email_template.js');
const mongoose = require("mongoose");
const util = require("util");

exports.get_institutions = (req, res, next) => {
    new Promise((resolve, reject) => {
// make global variable options for paginate method parameter
        let options = {
            perPage: global.config.pagination_limit,
            delta: global.config.delta,
            page: 1
        };
        if (req.query.page) {
            options.page = req.query.page;
        }
        /** ***skip check*****/
        let skipPages = options.page - 1;
        let startOfYear = new Date(moment.utc().startOf('year'));
        let endOfYear = new Date(moment.utc().endOf('year'));
        let aggregation_query = [
            {$match: {organisation_id: req.user.organisation_id, is_walkin: 0, is_deleted: 0}},
            {$sort: {name: 1}},
            {$skip: skipPages * global.config.pagination_limit},
            {$limit: global.config.pagination_limit},
            {"$lookup": {
                    from: "quizzes",
                    let: {ref_id: "$_id"},
                    pipeline: [
                        {
                            $match:
                                    {$expr:
                                                {$and: [
                                                        {$eq: ["$institute_id", "$$ref_id"]},
                                                        {$eq: ["$organisation_id", req.user.organisation_id]},
                                                        {$eq: ["$is_deleted", 0]},
                                                        {$gte: ["$created_at", startOfYear]},
                                                        {$lte: ["$created_at", endOfYear]},
                                                    ]
                                                }
                                    }
                        },
                        {$sort: {cretaed_at: -1}},
                        {$limit: 1},
                        {"$project": {status: 1}}
                    ],
                    as: "quiz"
                }
            },
            {"$lookup": {
                    from: "quiz_results",
                    let: {ref_id: "$_id"},
                    pipeline: [
                        {
                            $match:
                                    {$expr:
                                                {$and: [
                                                        {$eq: ["$institute_id", "$$ref_id"]},
                                                        {$eq: ["$organisation_id", req.user.organisation_id]},
                                                        {$eq: ["$is_deleted", 0]},
                                                        {$eq: ["$status", 2]},
                                                        {$eq: ["$placed_status", 1]},
                                                        {$gte: ["$created_at", startOfYear]},
                                                        {$lte: ["$created_at", endOfYear]},
                                                    ]
                                                }
                                    }
                        },
                        {$group: {_id: null, candidate_selected: {$sum: 1}}},
                        {"$project": {candidate_selected: 1}}
                    ],
                    as: "quiz_result"
                }
            },
            {$unwind: {path: "$quiz", preserveNullAndEmptyArrays: true}},
            {$unwind: {path: "$quiz_result", preserveNullAndEmptyArrays: true}},
            {$project: {name: 1, po_name: 1, qualification: 1, no_of_students: 1, candidate_selected: "$quiz_result.candidate_selected", test_status: {$cond: ["$quiz.status", "$quiz.status", 0]}}}
        ];
        let p1 = institutes.count({organisation_id: req.user.organisation_id, is_walkin: 0, is_deleted: 0});
        let p2 = institutes.aggregate(aggregation_query);
        Promise.all([p1, p2]).then(([count, result]) => {
            let last = parseInt((count % global.config.pagination_limit) == 0 ? count / global.config.pagination_limit : (count / global.config.pagination_limit) + 1);
            let pages = [];
            for (i = 1; i <= last; i++) {
                pages.push(i);
            }
            if (req.query.page) {
                res.render('institute/table', {
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
                    title: 'Manage Institutions',
                    active: 'manage_institutions_page'
                });
            } else {
                res.render('institute/instituteLIst', {
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
                    title: 'Manage Institutions',
                    active: 'manage_institutions_page'
                });
        }
        }).catch(error => {
            reject(error);
        });

    }).catch(err => {
        console.log(err);
//        res.redirect('/institutes');
    });
};