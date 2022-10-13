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
const question_categories = require("../models/question_categories");
const { Console } = require('console');

exports.get_students = (req, res, next) => {
    //console.log(req.params.extra_dat,"====================")
//    console.log(req.params,"===============")
//    const data=JSON.parse(req.params.inst_id)
//    var id=mongoose.Types.ObjectId(data[0])
//    console.log(typeof id)
//    console.log(data,"dataaaaaaaaaaaaaaaaaaa")
//    let dataa=[]
//    data.forEach((element)=>{
//        console.log(element,"elemmmmmmmmmmmmmmmm")
//        var id=mongoose.Types.ObjectId(element)
//        console.log(id,"dddddddddddddddd")
//        dataa.push(id)
//    })
//    console.log(dataa,"=================")
    //console.log(req.body.data.ids,"idsssssssssssssssss")
    new Promise((resolve, reject) => {
        // make global variable options for paginate method parameter
        let options = {
            perPage: global.config.pagination_limit,
            delta: global.config.delta,
            page: 1
        }
        //{ $in:req.body.data.ids}
        if (req.query.page) {
            options.page = req.query.page
        }
        console.log(req.user.organisation_id,"orgsidddddddddddddddddd")
        var condition = {
            organisation_id: req.user.organisation_id,
            institute_id: mongoose.Types.ObjectId(req.params.inst_id),
            student_shortlist:1,
            is_deleted: 0
        };
        if (req.query.status) {
            condition.status == parseInt(req.query.status);
        } else {
            condition.status = 2;
        }
        var user_lookup = {
            from: 'users',
            let: {
                ref_id: '$user_id'
            },
            pipeline: [{$match: {$expr: {$eq: ['$_id', '$$ref_id']}}}],
            as: 'user_detail'
        };
        if (req.query.name) {
            user_lookup = {
                from: 'users',
                let: {
                    ref_id: '$user_id'
                },
                pipeline: [{$match: {$expr: {$eq: ['$name', new RegExp('.*' + req.query.name + '.*', 'i')]}}}],
                as: 'user_detail'
            }
        }
        let p1 = quiz_results.count(condition);
        /** ***skip check*****/
        let skipPages = options.page - 1
        let aggregation_query = [{
                $match:condition,
            },
            {
                $sort: {
                    created_at: -1
                }
            },
            {
                $skip: skipPages * global.config.pagination_limit
            },
            {
                $limit: global.config.pagination_limit
            },
            {
                $lookup: user_lookup
            },
            {
                $unwind: {
                    path: '$user_detail',
                    preserveNullAndEmptyArrays: true
                }
            },
//            {
//                $lookup: {
//                    from: 'quizzes',
//                    let: {
//                        ref_id: '$_id'
//                    },
//                    pipeline: [{
//                            $match: {
//                                $expr: {
//                                    $and: [{
//                                            $eq: ['$institute_id', '$$ref_id']
//                                        },
//                                        {
//                                            $eq: ['$organisation_id', req.user.organisation_id]
//                                        },
//                                        {
//                                            $eq: ['$is_deleted', 0]
//                                        },
//                                        {
//                                            $gte: ['$created_at', startOfYear]
//                                        },
//                                        {
//                                            $lte: ['$created_at', endOfYear]
//                                        }
//                                    ]
//                                }
//                            }
//                        },
//                        {
//                            $sort: {
//                                cretaed_at: -1
//                            }
//                        },
//                        {
//                            $limit: 1
//                        },
//                        {
//                            $project: {
//                                status: 1
//                            }
//                        }
//                    ],
//                    as: 'quiz'
//                }
//            },
//            {
//                $lookup: {
//                    from: 'quiz_results',
//                    let: {
//                        ref_id: '$_id'
//                    },
//                    pipeline: [{
//                            $match: {
//                                $expr: {
//                                    $and: [{
//                                            $eq: ['$institute_id', '$$ref_id']
//                                        },
//                                        {
//                                            $eq: ['$organisation_id', req.user.organisation_id]
//                                        },
//                                        {
//                                            $eq: ['$is_deleted', 0]
//                                        },
//                                        {
//                                            $eq: ['$status', 2]
//                                        },
//                                        {
//                                            $eq: ['$placed_status', 1]
//                                        },
//                                        {
//                                            $gte: ['$created_at', startOfYear]
//                                        },
//                                        {
//                                            $lte: ['$created_at', endOfYear]
//                                        }
//                                    ]
//                                }
//                            }
//                        },
//                        {
//                            $group: {
//                                _id: null,
//                                candidate_selected: {
//                                    $sum: 1
//                                }
//                            }
//                        },
//                        {
//                            $project: {
//                                candidate_selected: 1
//                            }
//                        }
//                    ],
//                    as: 'quiz_result'
//                }
//            },
//            {
//                $unwind: {
//                    path: '$quiz',
//                    preserveNullAndEmptyArrays: true
//                }
//            },
//            {
//                $unwind: {
//                    path: '$quiz_result',
//                    preserveNullAndEmptyArrays: true
//                }
//            },
//            {
//                $project: {
//                    name: 1,
//                    po_name: 1,
//                    qualification: 1,
//                    no_of_students: 1,
//                    candidate_selected: '$quiz_result.candidate_selected',
//                    test_status: {
//                        $cond: ['$quiz.status', '$quiz.status', 0]
//                    }
//                }
//            },
        ]
        console.log(aggregation_query);
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
                    console.log(result);
                    if (req.query.page) {
                        res.render('students/table', {
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
                            title: 'Manage Students',
                            active: 'manage_institutions_page',
                            institute_id: req.params.inst_id
                        })
                    } else {
                        res.render('students/studentList', {
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
                            title: 'Manage Students',
                            active: 'manage_institutions_page',
                            institute_id: req.params.inst_id

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
exports.student_shortlist = (req, res, next) => {
console.log(req.body,"===========")
// data.forEach((element) => {
// const query={
// element
// }
// quiz_results.update({_id:"df"},{student_short_list:1}).then((updatedData)=>{
//     console.log(updatedData,"updateeeeeeeeeeeeeee")
//     if (updatedData != null) {
//         res.send({ status: 1});
//     } else
//         res.send({ status: 0 });
// });
// }).catch(err => {
// res.render('error', {
//     error: err
// })
// })
}
exports.get_user_detail = (req, res, next) => {
    new Promise((resolve, reject) => {
        users.findOne({_id: mongoose.Types.ObjectId(req.params.user_id)},{name:1,phone_no:1,dob:1,email:1,roll_no:1,father_name:1,qualification:1,branch:1,email:1}).then(userdata => {
            console.log(userdata);
            res.render('students/studentDetail', {
                title: 'Edit Student Detail',
                active: 'manage_institutions_page',
                data: userdata
            })
        }).catch(err => {
            reject(err)
        });
    })
}