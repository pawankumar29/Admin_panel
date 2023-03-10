const institutes = require('../models/institutes')
const moment = require('moment')
const momenttz = require('moment-timezone');
// const mails = require('../helper/send_mail.js');
// const email = require('../email_template_cms_pages');
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
const walkings = require("../models/walkings")
const quiz_results = require("../models/quiz_result")
const institute_categories = require("../models/institute_categories")
const question_categories = require("../models/question_categories")

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
};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/csv_files')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})
var upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('file')

function dataUpload(organisation_id, institute_id, batch, path) {
    // let organisation_id = req.user.organisation_id
    organisation_id = mongoose.Types.ObjectId(organisation_id);
    let invalidArray = [];
    let validArray = [];
    let csvDataArray = [];
    let emailArray = [];
    let updateBatchArray = [];
    let completePath = process.cwd() + '/' + path;
    //    console.log(completePath);
    var stream = fs.createReadStream(completePath)
    csv.fromStream(stream, {
        headers: true
    }).on('data', function(data) {
        if (emailArray.includes(data.email)) {
            data["message"] = "Email repeated in csv";
            data["errorStatus"] = 6;
            data["reject"] = 1;
        }
        emailArray.push(data.email)
        csvDataArray.push(data)
    }).on('end', function(count) {
        if (count > 0) {
            users.find({
                organisation_id: organisation_id,
                email: {
                    $in: emailArray
                },
                is_deleted: 0
            }).then(userData => {
                if (userData.status == 1) {
                    let data = userData.data;
                    let matchedData = {};
                    for (index = 0; index < csvDataArray.length; index++) {
                        let obj = csvDataArray[index];
                        let alreadyExist = 0;
                        if (obj["email"] && obj["name"] && obj["qualification"] && obj["branch"] && obj["roll_no"] && obj["phone_no"] && obj["father_name"] && obj["dob"]) {
                            if (moment(obj["dob"], "MM/DD/YYYY", true).isValid()) {
                                if (!validateEmail(obj["email"])) {
                                    obj["message"] = "Invalid Email format.Please check";
                                    obj["errorStatus"] = 6; //field missing
                                    obj["index"] = index;
                                    invalidArray.push(obj);
                                    continue;
                                }
                                if (obj["reject"] == 1) {
                                    invalidArray.push(obj);
                                    continue;
                                }
                                //check whether user already exist in system with same organisation
                                data.forEach(userobj => {
                                    if (userobj.email == obj.email) {
                                        alreadyExist = 1;
                                        matchedData = userobj;
                                    }
                                });
                                if (alreadyExist == 1) {
                                    if (matchedData.institute_id.toString() != institute_id) {
                                        obj["message"] = "User email is already registered with another institute.";
                                        obj["errorStatus"] = 3; //field missing
                                        obj["index"] = index;
                                        invalidArray.push(obj);
                                        continue;
                                    } else if (matchedData.is_walkin_user == 1) {
                                        obj["message"] = "User already present as walkin user in the system.";
                                        obj["errorStatus"] = 4; //field missing
                                        obj["index"] = index;
                                        invalidArray.push(obj);
                                        continue;
                                    } else if (matchedData.batch !== obj["batch"]) {
                                        updateBatchArray.push(mongoose.Types.ObjectId(matchedData["_id"]));
                                    } else {
                                        obj["message"] = "User already present in the system.";
                                        obj["errorStatus"] = 5; //field missing
                                        obj["index"] = index;
                                        invalidArray.push(obj);
                                        continue;
                                    }
                                } else {
                                    validArray.push({
                                        "institute_id": institute_id,
                                        "organisation_id": organisation_id,
                                        "is_walkin_user": 0,
                                        "role": roles.app_user,
                                        "batch": batch,
                                        "status": 1,
                                        "name": obj["name"],
                                        "roll_no": obj["roll_no"],
                                        "phone_no": obj["phone_no"],
                                        "father_name": obj["father_name"],
                                        "dob": obj["dob"],
                                        "email": obj["email"].toString().toLowerCase(),
                                        "qualification": obj["qualification"],
                                        "branch": obj["branch"]
                                    });
                                }
                            } else {
                                obj["message"] = "dob format is not correct.";
                                obj["errorStatus"] = 2; //field missing
                                obj["index"] = index;
                                invalidArray.push(obj);
                                continue;
                            }
                        } else {
                            obj["message"] = "Fields are missing.";
                            obj["errorStatus"] = 1; //field missing
                            obj["index"] = index;
                            invalidArray.push(obj);
                            continue;
                        }
                    }
                    console.log("valid array");
                    console.log(validArray);
                    console.log("invalid array");
                    console.log(invalidArray)
                    console.log("batch to update");
                    console.log(updateBatchArray);
                    let promiseArray = [];
                    if (validArray.length > 0) {
                        promiseArray.push(users.insertMany(validArray));
                    }
                    if (updateBatchArray.length > 0) {
                        users.update({ _id: { $in: updateBatchArray }, is_deleted: 0, organisation_id: organisation_id }, { batch: batch })
                    }
                    let no_of_students = validArray.length + updateBatchArray.length;
                    promiseArray.push(institutes.update({ _id: mongoose.Types.ObjectId(institute_id), is_deleted: 0 }, { no_of_students: no_of_students }));
                    Promise.all(promiseArray).then(([insert, update, updatecount]) => {
                        return { message: "success", status: 1, errorData: invalidArray };
                    }).catch(err => {
                        return { message: err.message, status: 0 }
                    })
                } else {
                    console.log("error in find data")
                }
            }).catch(error => {
                console.log(error)
                return {
                    message: error.message,
                    status: 0
                }
            })
        }
    })
}


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
            },
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
var addNewInstituteValidator = function(req, res, next) {
    req.checkBody('name', 'name is required').notEmpty()
        //    req.checkBody('batch', 'batch is required').notEmpty()
    req.checkBody('po_name', 'P.O name is required').notEmpty()
    req.checkBody('po_email', 'P.O email is required').notEmpty()
    req.checkBody('resume', 'Resume is required').notEmpty()
    return req.validationErrors(true)
}

exports.add_new_institutions = (req, res, next) => {
    try {
        upload(req, res, function(err) {
            if (!err) {
                new Promise((resolve, reject) => {
                    var errors = addNewInstituteValidator(req, res, next)
                    if (!errors) {
                        settings
                            .findOnePromise({}, {
                                instruction: 1
                            })
                            .then(data => {
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
                                        instruction: JSON.parse(JSON.stringify(data))[
                                            'instruction'
                                        ],
                                        organisation_id: req.user.organisation_id
                                    }
                                    institutes
                                        .save(insertData)
                                        .then(result => {
                                            question_categories.find({ default: 1, is_deleted: 0, status: 1, organisation_id: req.user.organisation_id }).then(default_categories => {
                                                default_categories = JSON.parse(JSON.stringify(default_categories));
                                                let new_inst_categories = default_categories.map(obj => {
                                                    obj.institute_id = result._id;
                                                    obj.category_id = obj._id;
                                                    obj.sub_category.map(sub_cats => {
                                                        sub_cats.sub_category_id = sub_cats._id;
                                                        delete sub_cats._id;
                                                    });
                                                    delete obj._id;
                                                    delete obj.default;
                                                    return obj;
                                                });
                                                institute_categories.insertMany(new_inst_categories).then(inst_cat_added => {
                                                    if (req.file) {
                                                        let response = dataUpload(req.user.organisation_id.toString(), result._id.toString(), req.body.batch.toString(), req.file.path);
                                                        req.flash('success', 'Institution added successfully!!')
                                                        res.redirect('/institutes')
                                                    } else {
                                                        req.flash('success', 'Institution added successfully!!')
                                                        res.redirect('/institutes')
                                                    }
                                                }).catch(err => {
                                                    console.log(err);
                                                });
                                            }).catch(err => {
                                                console.log(err);
                                            });

                                            //                                                    req.flash('success', 'Institution added successfully!!')
                                            //                                                    res.redirect('/institutes')
                                        })
                                        .catch(err => {
                                            reject(err)
                                        })
                                } else {
                                    req.flash('error', 'invalid value for resume.')
                                    res.redirect('/institutes/add')
                                }
                            })
                            .catch(error => {
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
}

exports.get_edit_institution = (req, res, next) => {
    try {
        new Promise((resolve, reject) => {
            let p1 = settings.findOnePromise({}, {
                qualification: 1
            })
            let p2 = institutes.findOne({
                _id: mongoose.Types.ObjectId(req.params.id),
                status: 1,
                is_deleted: 0
            })
            Promise.all([p1, p2])
                .then(([qualificationData, data]) => {
                    if (data) {
                        compQualification = qualificationData.qualification.map(obj => {
                            if (data['qualification'].includes(obj)) {
                                return {
                                    match: 1,
                                    text: obj
                                }
                            } else {
                                return {
                                    match: 0,
                                    text: obj
                                }
                            }
                        })
                        res.render('institute/edit', {
                            title: 'Edit Institution',
                            active: 'manage_institutions_page',
                            qualification: compQualification,
                            institute: data,
                            message: req.flash()
                        })
                    } else {
                        reject({
                            message: 'Insttute data can not be edit.'
                        })
                    }
                })
                .catch(error => {
                    reject(error)
                })
                // render view add institution page
        }).catch(error => {
            req.flash('error', error.message)
            res.redirect('/institutes')
        })
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
}
var editInstituteValidator = function(req, res, next) {
    req.checkBody('name', 'name is required').notEmpty()
    req.checkBody('po_name', 'P.O name is required').notEmpty()
    req.checkBody('po_email', 'P.O email is required').notEmpty()
    req.checkBody('resume', 'Resume is required').notEmpty()
    req.checkBody('no_of_students', 'number of students is required').notEmpty()
    return req.validationErrors(true)
}
exports.add_batch = (req, res, next) => {
    try {
        upload(req, res, function(err) {
            if (!err) {
                if (req.file) {
                    let response = dataUpload(req.user.organisation_id.toString(), req.body.institute_id, req.body.batch.toString(), req.file.path);
                    req.flash('success', 'Students added successfully!!')
                    res.redirect('/institutes')
                } else {
                    req.flash('error', 'Please Upload a csv file of student details')
                    res.redirect('/institutes')
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
exports.post_edit_institution = (req, res, next) => {
    new Promise((resolve, reject) => {
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
                    resume: parseInt(req.body.resume)
                }
                institutes
                    .update({
                            organisation_id: req.user.organisation_id,
                            _id: mongoose.Types.ObjectId(req.params.id),
                            status: 1,
                            is_deleted: 0
                        },
                        updateData
                    )
                    .then(ressult => {
                        req.flash('success', 'Institution detail changed successfully!!')
                        res.redirect('/institutes')
                    })
                    .catch(err => {
                        reject(err)
                    })
            } else {
                req.flash('error', 'invalid value for resume.')
                res.redirect('/institutes/edit/' + req.param.id.toString())
            }
        } else {
            req.flash('error', Object.values(errors)[0].msg)
            res.redirect('/institutes/edit/' + req.param.id.toString())
        }
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
}
exports.get_institutes_students_list = async(req,res,next) =>{
  try {
        const institute_id = mongoose.Types.ObjectId(req.params.id)
        const studentList = await users.find({institute_id:institute_id})
        const studentEstimateCount = await users.count({institute_id:institute_id})
        const updatenumberofstudnet = await institutes.update({_id:institute_id},{
            no_of_students:studentEstimateCount.data
        })
        res.render('institute/instituteStudentList',{studentList:studentList,institute_id:institute_id, title: 'Student Listing',
        active: 'stude_list'})
  } catch (error) {
      console.log(error)
  }
}
exports.post_student_add_form = async(req,res,next)=>{
    try {
        //    const organisation_id = req.user.organisation_id
        const institute_id = req.body.institute_id
        const addStudent = await users.insertMany(req.body)
        req.flash('success','New Student added successfully')
        res.redirect('/institutes')
        
    } catch (error) {
        
    }
}
exports.get_students_add_form = async(req,res)=>{
    try {
            const institute_id = mongoose.Types.ObjectId(req.params.id)
            const organisation_id = req.user.organisation_id
            res.render('institute/studentAddForm',{title: 'Add Students',
            active: 'Add Student',institute_id:institute_id,organisation_id:organisation_id})

    } catch (error) {
        
    }
}
exports.delete_institute = (req, res, next) => {
    new Promise((resolve, reject) => {
        let institute_id = mongoose.Types.ObjectId(req.params.id);
        console.log("institute_id");
        console.log(institute_id);
        let p1 = institutes.update({ _id: institute_id, is_deleted: 0 }, { is_deleted: 1 });
        let p2 = users.update({ institute_id: institute_id, is_deleted: 0 }, { is_deleted: 1 });
        let p3 = quiz_results.update({ institute_id: institute_id, is_deleted: 0 }, { is_deleted: 1 });
        let p4 = quizzes.update({ institute_id: institute_id, is_deleted: 0 }, { is_deleted: 1 });
        let p5 = institute_categories.update({ institute_id: institute_id, is_deleted: 0 }, { is_deleted: 1 });

        Promise.all([p1, p2, p3, p4, p5]).then(([p1res, p2res, p3res, p4res, p5res]) => {
            console.log("institute update");
            console.log(p1res);
            console.log("user update");
            console.log(p2res);
            console.log("quizres update");
            console.log(p3res);
            console.log("quiz update");
            console.log(p4res);
            console.log("institute categories update");
            console.log(p5res);
            req.flash('success', "Institute deleted successfully.");
            res.redirect('/institutes')
        }).catch(err => {
            req.flash('error', err.message)
            res.redirect('/institutes')
        });
    }).catch(err => {
        req.flash('error', err.message)
        res.redirect('/institutes')
    })
};

exports.csvDowload = (req, res, next) => {
    new Promise((resolve, reject) => {
        res.download('./public/csv_sample/user_csv_sample.csv')
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
}

exports.enable_test = (req, res, next) => {
    new Promise(async(resolve, reject) => {
        console.log("body");
        let datetime = req.body.date + " " + req.body.time;
        let scheduleDate = moment(datetime, "MM/DD/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
        var newdate = momenttz.tz(scheduleDate, req.cookies.time_zone_offset).utc();
        let endDate = newdate.clone();

        endDate = endDate.add(parseInt(req.body.duration), "m");
        let dataToinsert = req.body.institute.map(institute_id => {
            return {
                "institute_id": mongoose.Types.ObjectId(institute_id),
                "organisation_id": mongoose.Types.ObjectId(req.user.organisation_id),
                "batch_year": parseInt(req.body.batch),
                "start_time": newdate,
                "duration": parseInt(req.body.duration),
                "end_time": endDate,
                "status": 1,
            }
        });
        let insertedData = await quizzes.insertMany(dataToinsert);
        // console.log(insertedData);
        res.status(200).send({ status: 1, message: "Success" });
    }).catch(err => {
        req.flash('error', err.message)
        res.redirect('/institutes')
    })
};
exports.addWalkins = async(req, res, next) => {
    try {
            let options = {perPage: global.config.pagination_limit,delta: global.config.delta,page: 1}
            if (req.query.page)
            {
                options.page = req.query.page
            }
            let skipPages = options.page - 1
            let startOfYear = new Date(moment.utc().startOf('year'))
            let endOfYear = new Date(moment.utc().endOf('year'))
            let aggregation_query = [{
                    $match: {
                        organisation_id: req.user.organisation_id,
                        is_walkin: 1,
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
                                                $eq: ['$walkings_id', '$$ref_id']
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
                },
            ]
            let p1 = walkings.count({
                organisation_id: req.user.organisation_id,
                is_walkin: 1,
                is_deleted: 0
            })
            let p2 = walkings.aggregate(aggregation_query)
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
                        title: 'Manage Walkings',
                        active: 'manage_institutions_page'
                    })
                } else {
                    res.render('institute/addWalkinsForm', {
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
                        title: 'Manage Walkings',
                        active: 'manage_institutions_page'
                    })
                }
            })
            .catch(error => {
                reject(error)
            })
            // res.render('institute/addWalkinsTable', {title: 'Walkins'})
    } catch (error) {
        console.log(error)
    }
};
exports.addNewWalkies = (req,res,next)=>{
    try {
        upload(req, res, async function(err) {
            if (!err) {
                const settingData = await settings.findOnePromise({},{qualification: 1})
                if(settingData){
                   res.render('institute/addW',{title:"Add Walkings", qualification: settingData.qualification,})
                }
            }
        })
    } catch (err) {
        res.render('error', {
            error: err
        })
    }
}
exports.postAddWalkins = (req,res,next)=>{
    try {
        upload(req, res, async function(err) {
            if (!err) {
                const settingData = await settings.findOnePromise({}, {instruction: 1})
                if(parseInt(req.body.resume) == 1 ||parseInt(req.body.resume) == 0){
                    let insertData = {
                        name: req.body.name.trim(),
                        qualification: req.body.qualification,
                        is_walkin: 1,
                         resume: parseInt(req.body.resume),
                        instruction: JSON.parse(JSON.stringify(settingData))[
                            'instruction'
                        ],
                        organisation_id: req.user.organisation_id
                    }
                    const walkingData = await walkings.save(insertData);
                    const questionCategories = await question_categories.find({ default: 1, is_deleted: 0, status: 1 })
                    req.flash('success',"New Walkings added successfully")
                    res.redirect('/institutes/get-walkins')
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
exports.get_edit_walkings = async(req,res,next)=>{
    try {
        new Promise((resolve, reject) => {
            let p1 = settings.findOnePromise({}, {
                qualification: 1
            })
            let p2 = walkings.findOne({
                _id: mongoose.Types.ObjectId(req.params.id),
                status: 1,
                is_deleted: 0
            })
            Promise.all([p1, p2])
                .then(([qualificationData, data]) => {
                    if (data) {
                        compQualification = qualificationData.qualification.map(obj => {
                            if (data['qualification'].includes(obj)) {
                                return {
                                    match: 1,
                                    text: obj
                                }
                            } else {
                                return {
                                    match: 0,
                                    text: obj
                                }
                            }
                        })
                        res.render('institute/walkingsEdit', {
                            title: 'Edit Walkings Detals',
                            qualification: compQualification,
                            institute: data,
                            message: req.flash()
                        })
                    } else {
                        reject({
                            message: 'Walkings data can not be edit.'
                        })
                    }
                })
                .catch(error => {
                    reject(error)
                })
                // render view add institution page
        }).catch(error => {
            req.flash('error', error.message)
            res.redirect('/institutes')
        })
    }
    catch (error) {
        res.render('error', {
            error: err
        })
    }
}
exports.post_edit_walkings = (req, res, next) => {
    new Promise((resolve, reject) => {
        //        console.log(req.body);       
            if (parseInt(req.body.resume) == 1 || parseInt(req.body.resume) == 0) {
                let updateData = {
                    name: req.body.name.trim(),
                    qualification: req.body.qualification,
                    is_walkin: 1,
                    resume: parseInt(req.body.resume)
                }
                walkings
                    .update({
                            organisation_id: req.user.organisation_id,
                            _id: mongoose.Types.ObjectId(req.params.id),
                            status: 1,
                            is_deleted: 0
                        },
                        updateData
                    )
                    .then(ressult => {
                        req.flash('success', 'Walkings detail changed successfully!!')
                        res.redirect('/institutes/get-walkins')
                    })
                    .catch(err => {
                        reject(err)
                    })
            } else {
                req.flash('error', 'invalid value for resume.')
                res.redirect('/institutes/get-edit-walkings/' + req.param.id)
            }
    }).catch(err => {
        res.render('error', {
            error: err
        })
    })
}
exports.enable_test_walkings = (req, res, next) => {
    new Promise(async(resolve, reject) => { 
        let datetime = req.body.date + " " + req.body.time;
        let scheduleDate = moment(datetime, "MM/DD/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
        var newdate = momenttz.tz(scheduleDate, req.cookies.time_zone_offset).utc();
        let endDate = newdate.clone();

        endDate = endDate.add(parseInt(req.body.duration), "m");
        let dataToinsert = req.body.walkings.map(walkings_id => {
            return {
                "walkings_id": mongoose.Types.ObjectId(walkings_id),
                "organisation_id": mongoose.Types.ObjectId(req.user.organisation_id),
                "start_time": newdate,
                "duration": parseInt(req.body.duration),
                "end_time": endDate,
                "status": 1,
                "is_walking":1
            }
        });
        let insertedData = await quizzes.insertMany(dataToinsert);
        // console.log(insertedData);
        res.status(200).send({ status: 1, message: "Success" });
    }).catch(err => {
        req.flash('error', err.message)
        res.redirect('/institutes')
    })
};
exports.add_new_walkings = (req, res, next) => {
    try {
        upload(req, res, function(err) {
            if (!err) {
                if (req.file) {
                    let response = dataUploadWalkings(req.user.organisation_id.toString(), req.body.walkings_id, req.file.path);
                    req.flash('success', 'Students added successfully!!')
                    res.redirect('/institutes/get-walkins')
                } else {
                    req.flash('error', 'Please Upload a csv file of student details')
                    res.redirect('/institutes/get-walkins')
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
function dataUploadWalkings(organisation_id, walkings_id,path) {
    // let organisation_id = req.user.organisation_id
    organisation_id = mongoose.Types.ObjectId(organisation_id);
    let invalidArray = [];
    let validArray = [];
    let csvDataArray = [];
    let emailArray = [];
    let completePath = process.cwd() + '/' + path;
    //    console.log(completePath);
    var stream = fs.createReadStream(completePath)
    csv.fromStream(stream, {
        headers: true
    }).on('data', function(data) {
        if (emailArray.includes(data.email)) {
            data["message"] = "Email repeated in csv";
            data["errorStatus"] = 6;
            data["reject"] = 1;
        }
        emailArray.push(data.email)
        csvDataArray.push(data)
    }).on('end', function(count) {
        if (count > 0) {
            users.find({
                organisation_id: organisation_id,
                email: {
                    $in: emailArray
                },
                is_deleted: 0
            }).then(userData => {
                if (userData.status == 1) {
                    let data = userData.data;
                    let matchedData = {};
                    for (index = 0; index < csvDataArray.length; index++) {
                        let obj = csvDataArray[index];
                        let alreadyExist = 0;
                        if (obj["email"] && obj["name"] && obj["qualification"] && obj["branch"] && obj["roll_no"] && obj["phone_no"] && obj["father_name"] && obj["dob"]) {
                            if (moment(obj["dob"], "MM/DD/YYYY", true).isValid()) {
                                if (!validateEmail(obj["email"])) {
                                    obj["message"] = "Invalid Email format.Please check";
                                    obj["errorStatus"] = 6; //field missing
                                    obj["index"] = index;
                                    invalidArray.push(obj);
                                    continue;
                                }
                                if (obj["reject"] == 1) {
                                    invalidArray.push(obj);
                                    continue;
                                }
                                //check whether user already exist in system with same organisation
                                data.forEach(userobj => {
                                    if (userobj.email == obj.email) {
                                        alreadyExist = 1;
                                        matchedData = userobj;
                                    }
                                });
                                if (alreadyExist == 1) {
                                    if (matchedData.walkings_id.toString() != walkings_id    ) {
                                        obj["message"] = "User email is already registered with another institute.";
                                        obj["errorStatus"] = 3; //field missing
                                        obj["index"] = index;
                                        invalidArray.push(obj);
                                        continue;
                                    } else if (matchedData.is_walkin_user == 1) {
                                        obj["message"] = "User already present as walkin user in the system.";
                                        obj["errorStatus"] = 4; //field missing
                                        obj["index"] = index;
                                        invalidArray.push(obj);
                                        continue;
                                    }  else {
                                        obj["message"] = "User already present in the system.";
                                        obj["errorStatus"] = 5; //field missing
                                        obj["index"] = index;
                                        invalidArray.push(obj);
                                        continue;
                                    }
                                } else {
                                    validArray.push({
                                        "walkings_id": walkings_id,
                                        "organisation_id": organisation_id,
                                        "is_walkin_user": 0,
                                        "role": roles.app_user,
                                        "status": 1,
                                        "name": obj["name"],
                                        "roll_no": obj["roll_no"],
                                        "phone_no": obj["phone_no"],
                                        "father_name": obj["father_name"],
                                        "dob": obj["dob"],
                                        "email": obj["email"].toString().toLowerCase(),
                                        "qualification": obj["qualification"],
                                        "branch": obj["branch"]
                                    });
                                }
                            } else {
                                obj["message"] = "dob format is not correct.";
                                obj["errorStatus"] = 2; //field missing
                                obj["index"] = index;
                                invalidArray.push(obj);
                                continue;
                            }
                        } else {
                            obj["message"] = "Fields are missing.";
                            obj["errorStatus"] = 1; //field missing
                            obj["index"] = index;
                            invalidArray.push(obj);
                            continue;
                        }
                    }
                    console.log("valid array");
                    console.log(validArray);
                    console.log("invalid array");
                    console.log(invalidArray)
                    let promiseArray = [];
                    if (validArray.length > 0) {
                        promiseArray.push(users.insertMany(validArray));
                    }
                 
                    let no_of_students = validArray.length 
                    promiseArray.push(walkings.update({ _id: mongoose.Types.ObjectId(walkings_id), is_deleted: 0 }, { no_of_students: no_of_students }));
                    Promise.all(promiseArray).then(([insert, update, updatecount]) => {
                        return { message: "success", status: 1, errorData: invalidArray };
                    }).catch(err => {
                        return { message: err.message, status: 0 }
                    })
                } else {
                    console.log("error in find data")
                }
            }).catch(error => {
                console.log(error)
                return {
                    message: error.message,
                    status: 0
                }
            })
        }
    })
}