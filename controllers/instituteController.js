const institutes = require('../models/institutes')
const moment = require('moment')
// const mails = require('../helper/send_mail.js');
// const email = require('../email_template_cms_pages');
const email_templates = require('../models/email_template.js')
const mongoose = require('mongoose')
const settings = require('../models/settings')
var multer = require('multer')
var fs = require("fs");
var csv = require("fast-csv");
function fileFilter(req, file, cb) {
    if (
            file.mimetype == 'text/csv' ||
            file.mimetype == 'text/xlsx' ||
            file.mimetype == 'text/xls'
            ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/csv_files')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})
var upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('file')

function dataUpload(path) {
    let invalidArray = [];
    let validArray = [];
    let completePath = process.cwd() + "/" + path;
    console.log(completePath);
    var stream = fs.createReadStream(completePath);
    csv.fromStream(stream, {headers: true}).validate(function (data) {
//        if (data.name && data.roll_no && data.father_name && data.phone_no && data.dob && data.qualification && data.branch && data.email_id)
//        {
//            return
//        } else {
//
//        }
        if (data.name) {
            return
        } else {

        }
    }).on("data-invalid", function (data) {
        //do something with invalid row
        invalidArray.push(data);
    }).on("data", function (data) {
        validArray.push(data);
    }).on("end", function (count) {
        console.log("done");
        console.log(count);
        console.log("invalid array");
        console.log(invalidArray);
        console.log("valid array");
        console.log(validArray);
    });


}

dataUpload("public/csv_files/student_data.csv");
exports.get_institutions = (req, res, next) => {
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
        let endOfYear = new Date(moment.utc().endOf('year'))
        let aggregation_query = [{
                $match: {
                    organisation_id: req.user.organisation_id,
                    is_walkin: 0,
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
            {
                $lookup: {
                    from: 'quizzes',
                    let: {
                        ref_id: '$_id'
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ['$institute_id', '$$ref_id']
                                        },
                                        {
                                            $eq: ['$organisation_id', req.user.organisation_id]
                                        },
                                        {
                                            $eq: ['$is_deleted', 0]
                                        },
                                        {
                                            $gte: ['$created_at', startOfYear]
                                        },
                                        {
                                            $lte: ['$created_at', endOfYear]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: {
                                cretaed_at: -1
                            }
                        },
                        {
                            $limit: 1
                        },
                        {
                            $project: {
                                status: 1
                            }
                        }
                    ],
                    as: 'quiz'
                }
            },
            {
                $lookup: {
                    from: 'quiz_results',
                    let: {
                        ref_id: '$_id'
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ['$institute_id', '$$ref_id']
                                        },
                                        {
                                            $eq: ['$organisation_id', req.user.organisation_id]
                                        },
                                        {
                                            $eq: ['$is_deleted', 0]
                                        },
                                        {
                                            $eq: ['$status', 2]
                                        },
                                        {
                                            $eq: ['$placed_status', 1]
                                        },
                                        {
                                            $gte: ['$created_at', startOfYear]
                                        },
                                        {
                                            $lte: ['$created_at', endOfYear]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                candidate_selected: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $project: {
                                candidate_selected: 1
                            }
                        }
                    ],
                    as: 'quiz_result'
                }
            },
            {
                $unwind: {
                    path: '$quiz',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$quiz_result',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    name: 1,
                    po_name: 1,
                    qualification: 1,
                    no_of_students: 1,
                    candidate_selected: '$quiz_result.candidate_selected',
                    test_status: {
                        $cond: ['$quiz.status', '$quiz.status', 0]
                    }
                }
            }
        ]
        let p1 = institutes.count({
            organisation_id: req.user.organisation_id,
            is_walkin: 0,
            is_deleted: 0
        })
        let p2 = institutes.aggregate(aggregation_query)
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
                        })
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

exports.add_institutions = (req, res, next) => {
    try {
        settings
                .findOnePromise({}, {
                    qualification: 1
                })
                .then(data => {
                    res.render('institute/add', {
                        title: 'Add Institution',
                        active: 'manage_institutions_page',
                        qualification: data.qualification,
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
var addNewInstituteValidator = function (req, res, next) {
    req.checkBody('name', 'name is required').notEmpty()
//    req.checkBody('batch', 'batch is required').notEmpty()
    req.checkBody('po_name', 'P.O name is required').notEmpty()
    req.checkBody('po_email', 'P.O email is required').notEmpty()
    req.checkBody('resume', 'Resume is required').notEmpty()
    return req.validationErrors(true)
}

exports.add_new_institutions = (req, res, next) => {
    try {
        upload(req, res, function (err) {
            if (!err) {
                new Promise((resolve, reject) => {
                    var errors = addNewInstituteValidator(req, res, next)
                    if (!errors) {
                        settings.findOnePromise({}, {
                            instruction: 1}).then(data => {
                            if (
                                    parseInt(req.body.resume) == 1 ||
                                    parseInt(req.body.resume) == 0
                                    ) {
                                let insertData = {
                                    name: req.body.name.trim(),
                                    po_name: req.body.po_name.trim(),
                                    po_email: req.body.po_email.trim(),
                                    qualification: req.body.qualification,
                                    is_walkin: 0,
                                    resume: parseInt(req.body.resume),
                                    instruction: JSON.parse(JSON.stringify(data))['instruction'],
                                    organisation_id: req.user.organisation_id
                                }
                                institutes.save(insertData).then(ressult => {
                                    if (req.file) {
                                        console.log("file path");
                                        console.log(req.file);


                                    } else {
                                        console.log("institute addede without batch");
                                        req.flash('success', 'Institution added successfully!!')
                                        res.redirect('/institutes')
                                    }
                                    req.flash('success', 'Institution added successfully!!')
                                    res.redirect('/institutes')
                                }).catch(err => {
                                    reject(err)
                                })
                            } else {
                                req.flash('error', 'invalid value for resume.')
                                res.redirect('/institutes/add')
                            }
                        }).catch(error => {
                            reject(error)
                        })
                    } else {
                        req.flash('error', Object.values(errors)[0].msg)
                        res.redirect('/institutes/add')
                    }
                }).catch(err => {
                    res.render('error', {
                        error: err
                    })
                })
            } else {
                console.log(err)
                res.render('error', {
                    error: err
                })
            }
        })
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
};

exports.get_edit_institution = (req, res, next) => {
    try {
        new Promise((resolve, reject) => {
            let p1 = settings.findOnePromise({}, {qualification: 1});
            let p2 = institutes.findOne({_id: mongoose.Types.ObjectId(req.params.id), status: 1, is_deleted: 0})
            Promise.all([p1, p2]).then(([qualificationData, data]) => {
                if (data) {
                    compQualification = qualificationData.qualification.map(obj => {
                        if (data["qualification"].includes(obj)) {
                            return ({match: 1, text: obj});
                        } else {
                            return ({match: 0, text: obj});
                        }
                    });
                    res.render('institute/edit', {
                        title: 'Edit Institution',
                        active: 'manage_institutions_page',
                        qualification: compQualification,
                        institute: data,
                        message: req.flash()
                    })
                } else {
                    reject({message: "Insttute data can not be edit."})
            }
            }).catch(error => {
                reject(error)
            })
            // render view add institution page
        }).catch(error => {
            req.flash("error", error.message);
            res.redirect("/institutes");
        });
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
};
var editInstituteValidator = function (req, res, next) {
    req.checkBody('name', 'name is required').notEmpty()
    req.checkBody('po_name', 'P.O name is required').notEmpty()
    req.checkBody('po_email', 'P.O email is required').notEmpty()
    req.checkBody('resume', 'Resume is required').notEmpty()
    req.checkBody('no_of_students', 'number of students is required').notEmpty()
    return req.validationErrors(true)
}
exports.post_edit_institution = (req, res, next) => {
    new Promise((resolve, reject) => {
//        console.log(req.body);
        var errors = editInstituteValidator(req, res, next)
        if (!errors) {
            if (parseInt(req.body.resume) == 1 || parseInt(req.body.resume) == 0) {
                let updateData = {
                    name: req.body.name.trim(),
                    po_name: req.body.po_name.trim(),
                    po_email: req.body.po_email.trim(),
                    qualification: req.body.qualification,
                    no_of_students: parseInt(req.body.no_of_students),
                    is_walkin: 0,
                    resume: parseInt(req.body.resume),
                }
                institutes.update({organisation_id: req.user.organisation_id, _id: mongoose.Types.ObjectId(req.params.id), status: 1, is_deleted: 0}, updateData).then(ressult => {
                    req.flash('success', 'Institution detail changed successfully!!')
                    res.redirect('/institutes')
                }).catch(err => {
                    reject(err)
                })
            } else {
                req.flash('error', 'invalid value for resume.')
                res.redirect('/institutes/edit/' + req.param.id.toString())
            }
        } else {
            req.flash('error', Object.values(errors)[0].msg)
            res.redirect('/institutes/edit/' + req.param.id.toString());
        }
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
};

exports.csvDowload = (req, res, next) => {
    new Promise((resolve, reject) => {
        res.download("./public/csv_sample/user_csv_sample.csv");
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
}