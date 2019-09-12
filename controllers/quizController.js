const institutes = require('../models/institutes')
const moment = require('moment')
const momenttz = require('moment-timezone');
// const mails = require('../helper/send_mail.js');
// const email = require('../email_template_cms_pages');
const email_templates = require('../models/email_template.js')
const mongoose = require('mongoose');
const questionModel = mongoose.model('questions');
const users = require("../models/user");
const settings = require('../models/settings');
var util = require('util');
const quizzes = require("../models/quiz");
const quiz_results = require("../models/quiz_result");
const institute_categories = require("../models/institute_categories");
const question_categories = require("../models/question_categories");
const questions = require("../models/questions");
var multer = require('multer');
var util = require('util');
var fs = require('fs')
var csv = require('fast-csv');

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
    destination: function(req, file, cb) {
        cb(null, './public/csv_files')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('file');

exports.get_categoriesList = (req, res, next) => {
    console.log(global.config.pagination_limit);
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
                $unwind: {
                    path: '$sub_category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $skip: skipPages * global.config.pagination_limit
            },
            {
                $limit: global.config.pagination_limit
            }
        ];
        let p1 = question_categories.count({
            organisation_id: req.user.organisation_id,
            is_deleted: 0
        })
        let p2 = question_categories.aggregate(aggregation_query)
        Promise.all([p1, p2])
            .then(([count, result]) => {
                //                    console.log(util.inspect(result,{depth:null}));
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
                    });
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
exports.get_scheduledList = (req, res, next) => {
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
                    start_time: 1
                }
            },
            {
                $lookup: {
                    from: 'institutes',
                    let: {
                        ref_id: '$institute_id'
                    },
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$ref_id'] } } }, { $project: { _id: 1, name: 1, no_of_students: 1 } }],
                    as: 'institute'
                }
            },
            {
                $unwind: {
                    path: '$institute',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    start_time: -1
                }
            }
            // {
            //     $skip: skipPages * global.config.pagination_limit
            // },
            // {
            //     $limit: global.config.pagination_limit
            // }
        ];
        let p1 = quizzes.count({
            organisation_id: req.user.organisation_id,
            is_deleted: 0
        })
        let p2 = quizzes.aggregate(aggregation_query)
            // console.log(util.inspect(aggregation_query, { depth: null }));
        Promise.all([p1, p2])
            .then(([count, result]) => {
                // console.log(util.inspect(result, { depth: null }));
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
                    res.render('quiz/scheduledList', {
                        response: JSON.parse(JSON.stringify(result)),
                        count: count,
                        prev: parseInt(options.page - 1 < 1 ? 1 : options.page - 1),
                        last: last,
                        pages: pages,
                        next: options.page == last ? last : last + 1,
                        message: req.flash(),
                        options: options,
                        current: req.query.page || 1,
                        delta: global.config.delta,
                        title: 'Manage Scheduled Test',
                        active: 'schedule_test'
                    });
                } else {
                    res.render('quiz/scheduledList', {
                        response: JSON.parse(JSON.stringify(result)),
                        count: count,
                        prev: parseInt(options.page - 1 < 1 ? 1 : options.page - 1),
                        last: last,
                        pages: pages,
                        next: options.page == last ? last : last + 1,
                        message: req.flash(),
                        options: options,
                        current: req.query.page || 1,
                        delta: global.config.delta,
                        title: 'Manage Scheduled Test',
                        active: 'schedule_test'
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
                });
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
            if (typeof(req.body.sub_category) == 'string') {
                sub_category = [{ name: req.body.sub_category }]
            } else {
                for (var i = 0; i < req.body.sub_category.length; i++) {
                    sub_category.push({ name: req.body.sub_category[i] });
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
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
}
exports.csvDowload = (req, res, next) => {
    new Promise((resolve, reject) => {
        res.download('./public/csv_sample/categoryQuestions.csv')
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
}
exports.getQuizDetail = (req, res, next) => {
    new Promise((resolve, reject) => {
        quizzes.findOne({ _id: req.params.id }).then(data => {
            if (data != null) {
                data = JSON.parse(JSON.stringify(data))
                data.start_time = momenttz.tz(data.start_time, req.cookies.time_zone_offset).format("YYYY-MM-DD HH:mm");
                res.send({ status: 1, data: data });
            } else
                res.send({ status: 0 });
        });
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
}
exports.updateQuizDetail = (req, res, next) => {
    new Promise((resolve, reject) => {
        let datetime = req.body.date + " " + req.body.time;
        let scheduleDate = moment(datetime, "MM/DD/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
        var newdate = momenttz.tz(scheduleDate, req.cookies.time_zone_offset).utc();
        let endDate = newdate.clone();
        endDate = endDate.add(parseInt(req.body.duration), "m");
        req.body.batch = parseInt(req.body.batch);
        req.body.start_time = newdate;
        req.body.end_time = endDate;
        req.body.duration = parseInt(req.body.duration);
        quizzes.update({ _id: req.body.quiz_id }, req.body).then(data => {
            if (data != null) {
                res.send({ status: 1, data: data });
            } else
                res.send({ status: 0 });
        });
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
}
exports.deleteQuiz = async(req, res, next) => {
    await quiz_id.delete({ quiz_id: req.params.id });
    await quizzes.delete({ _id: req.params.id });
    res.redirect('/quiz/scheduled');

}
exports.importCsvCat = (req, res, next) => {
    try {
        question_categories.findOne({ _id: req.params.cat_id }).then(data => {
            res.render('quiz/importQuestion', {
                category: data,
                title: 'Add Questions',
                active: 'manage_quiz_page',
                message: req.flash()
            })
        }).catch(err => {

        });
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
}
exports.addCsv = (req, res, next) => {
    try {
        upload(req, res, async function(err) {
            if (!err) {
                let sub_category_id = '';
                if (req.body.sub_category_id) {
                    sub_category_id = req.body.sub_category_id
                }
                if (req.file) {
                    let response = await dataUpload(req.user.organisation_id.toString(), req.body.category_id, sub_category_id, req.file.path);
                    req.flash('success', 'Questions added successfully!!')
                    res.redirect('/quiz')
                } else {
                    req.flash('error', 'Please Upload a csv file of questions details')
                    res.redirect('/quiz')
                }
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
}
exports.importCsvSubCat = (req, res, next) => {
    try {
        question_categories.findOne({ _id: req.params.cat_id }).then(data => {
            var sub_cat_data = {};
            for (var i = 0; i < data.sub_category.length; i++) {
                if (data.sub_category[i]._id.toString() == req.params.sub_cat_id.toString()) {
                    sub_cat_data = data.sub_category[i];
                    break;
                }
            }
            res.render('quiz/importQuestion', {
                category: data,
                sub_cat_data: sub_cat_data,
                title: 'Add Questions',
                active: 'manage_quiz_page',
                message: req.flash()
            })
        }).catch(err => {
            res.render('error', {
                error: err
            });
        });
    } catch (err) {

    }
}

async function dataUpload(organisation_id, category_id, sub_cat_id, path) {
    try {
        organisation_id = mongoose.Types.ObjectId(organisation_id);
        let invalidArray = [];
        let validArray = [];
        let csvDataArray = [];
        let completePath = process.cwd() + '/' + path;
        var stream = fs.createReadStream(completePath)
        csv.fromStream(stream, {
            headers: true
        }).on('data', function(data) {
            csvDataArray.push(data)
        }).on('end', async function(count) {
            if (count > 0) {
                for (let index = 0; index < csvDataArray.length; index++) {
                    let answer = [];
                    let obj = csvDataArray[index];
                    if (obj["question"] && obj["option1"] && obj["option2"] && obj["option3"] && obj["option4"] && obj["answer"]) {
                        obj["options"] = [];
                        if (obj["option1"] != "") {
                            if (obj["answer"].trim().toLowerCase() == "option1") {
                                answer.push("A")
                                obj["options"].push({ id: "A", option: obj["option1"], is_correct: 1 });
                            } else
                                obj["options"].push({ id: "A", option: obj["option1"], is_correct: 0 });
                        }
                        if (obj["option2"] != "") {
                            if (obj["answer"].trim().toLowerCase() == "option2") {
                                answer.push("B");
                                obj["options"].push({ id: "B", option: obj["option2"], is_correct: 1 });
                            } else
                                obj["options"].push({ id: "B", option: obj["option2"], is_correct: 0 });
                        }
                        if (obj["option3"] != "") {
                            if (obj["answer"].trim().toLowerCase() == "option3") {
                                answer.push("C")
                                obj["options"].push({ id: "C", option: obj["option3"], is_correct: 1 });
                            } else
                                obj["options"].push({ id: "C", option: obj["option3"], is_correct: 0 });
                        }
                        if (obj["option4"] != "") {
                            if (obj["answer"].trim().toLowerCase() == "option4") {
                                answer.push("D");
                                obj["options"].push({ id: "D", option: obj["option4"], is_correct: 1 });
                            } else
                                obj["options"].push({ id: "D", option: obj["option4"], is_correct: 0 });

                        }
                        if (!obj["image"]) {
                            obj["image"] = "";
                        }
                        if (answer.length) {
                            delete obj["option1"];
                            delete obj["option2"];
                            delete obj["option3"];
                            delete obj["option4"];
                            obj["answer"] = answer;
                            obj["organisation_id"] = organisation_id;
                            obj["category_id"] = category_id;
                            if (sub_cat_id != '')
                                obj["sub_category_id"] = sub_cat_id;
                            validArray.push(obj);
                        } else {
                            obj["message"] = "No Answer found";
                            obj["errorStatus"] = 1; //field missing
                            obj["index"] = index;
                            invalidArray.push(obj);
                        }
                    } else {
                        obj["message"] = "Fields are missing.";
                        obj["errorStatus"] = 1; //field missing
                        obj["index"] = index;
                        invalidArray.push(obj);
                    }
                }
                // console.log(validArray.length);
                // console.log(util.inspect(validArray, { depth: null }));
                console.log("Invalid Questions  ", invalidArray.length);
                console.log(util.inspect(invalidArray, { depth: null }));
                await questionModel.create(validArray);
                return Promise.resolve();
            }
        });
    } catch (err) {
        return Promise.reject(err);
    }
}