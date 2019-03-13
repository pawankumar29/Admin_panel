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
const  questions = require("../models/questions");
var multer = require('multer');
var util = require('util');
var fs = require('fs')
var csv = require('fast-csv');

function dataUpload(organisation_id, category_id, sub_category_id, path) {
    return new Promise((resolve, reject) => {
        try {

            organisation_id = mongoose.Types.ObjectId(organisation_id);
            category_id = mongoose.Types.ObjectId(category_id);
            if (sub_category_id) {
                sub_category_id = mongoose.Types.ObjectId(sub_category_id);
            }
            let csvDataArray = [];
            let completePath = process.cwd() + '/' + path;
            let stream = fs.createReadStream(completePath)
            csv.fromStream(stream, {
                headers: true
            }).on('data', function (data) {
                if ((data.question || data.question != "") && (data.answer || data.answer != "")) {
                    let length = Object.keys(data).length;
                    var answer = [];
                    let obj = {
                        "question": data.question,
                        "organisation_id": organisation_id,
                        "category_id": category_id,
                        "image": data.image || "",
                        "status": 1,
                        "is_deleted": 0,
                        "options": [],
                    };
                    for (let i = 1; i <= length; i++) {
                        if (data["option" + i]) {
                            if (data.answer.toString() == ("option" + i).toString()) {
                                answer.push(String.fromCharCode(64 + i));
                            }
                            obj.options.push({
                                "id": String.fromCharCode(64 + i),
                                "option": data["option" + i],
                                "is_correct": data.answer.toString().toUpperCase() == String.fromCharCode(64 + i) ? 1 : 0
                            });
                        }
                    }

                    if (sub_category_id) {
                        obj["sub_category_id"] = sub_category_id;
                    }
                    obj["answer"] = data.answer;
                    csvDataArray.push(obj);
                }
            }).on('end', function (count) {
                console.log("here in return ");
                resolve(csvDataArray);
            });
        } catch (err) {
            reject(err);
        }
    });


}



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
//        console.log(util.inspect(aggregation_query, {depth: null}));
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
            if (typeof (req.body.sub_category) == 'string') {
                sub_category = [{name: req.body.sub_category}]
            } else {
                for (var i = 0; i < req.body.sub_category.length; i++) {
                    sub_category.push({name: req.body.sub_category[i]});
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
exports.csvDowload = (req, res, next) => {
    new Promise((resolve, reject) => {
        res.download('./public/csv_sample/categoryQuestions.csv')
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
}
exports.importCsvCat = (req, res, next) => {
    try {
        question_categories.findOne({_id: req.params.cat_id}).then(data => {
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
        upload(req, res, async function (err) {
            if (!err) {

                let data = await dataUpload(req.user.organisaton_id, req.body.category_id, req.body.sub_category_id, req.file.path);
                //function call to csv;
                console.log("data");
                console.log(data);
                let questionInsert = questions.insertMany(data).then(insertData => {
                    res.redirect("/quiz");
                }).catch(err => {
                    console.log(err)
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
}
exports.importCsvSubCat = (req, res, next) => {
    try {
        question_categories.findOne({_id: req.params.cat_id}).then(data => {
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



