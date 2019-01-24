const institutes = require('../models/institutes')
const moment = require('moment')
// const mails = require('../helper/send_mail.js');
// const email = require('../email_template_cms_pages');
const email_templates = require('../models/email_template.js')
const mongoose = require('mongoose')
const settings = require('../models/settings')
const swig = require('swig');
exports.get_instructions = (req, res, next) => {
    try {
        institutes
                .findOne({
                    _id: mongoose.Types.ObjectId(req.params.id),
                    status: 1,
                    is_deleted: 0
                }, {
                    instruction: 1
                })
                .then(data => {
                    res.render('institute/instructions', {
                        title: 'Manage Instructions',
                        active: 'manage_institutions_page',
                        instructions: data.instruction,
                        id: data.id,
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
};
var deleteInstructionValidator = function (req, res, next) {
    req.checkBody('id', 'id is required').notEmpty()
    req.checkBody('instruction', 'instruction is required').notEmpty()
    return req.validationErrors(true)
}
exports.delete_instruction = (req, res, next) => {
    try {
        let table = '<table class="table table-responsive-md"><input type="hidden" id="institute_id" value="{{id}}">{% set index = 1 %}{% for data in instructions %}<tr><td class="col-md-1">{{index}}<input type="hidden" value="{{data}}"></td><td class="col-md-8 content" editabl="true">{{data}}</td><td class="col-md-2"><span class="table-remove"><button type="button" class="btn btn-icon-only yellow edit"><i class="fa fa-edit"></i></button><button type="button" class="btn btn-icon-only red delete"><i class="fa fa-trash"></i></button></span></td></tr>{% set index = index + 1 %} {% endfor %}</table>';
        new Promise((resolve, reject) => {
            var errors = deleteInstructionValidator(req, res, next)
            if (!errors) {
                institutes.update({
                    _id: mongoose.Types.ObjectId(req.body.id),
                    status: 1,
                    is_deleted: 0
                }, {$pull: {instruction: req.body.instruction.toString()}}).then(data => {
                    institutes.findOne({_id: mongoose.Types.ObjectId(req.body.id), status: 1, is_deleted: 0}, {instruction: 1}).then(data => {
                        let template = swig.render(table, {locals: {instructions: data.instruction, id: data.id, }});
                        res.status(200).send({message: "success", data: template})
                    }).catch(error => {
                        reject(error)
                    })
                }).catch(error => {
                    reject(error)
                })
            } else {
                res.status(400).send({message: Object.values(errors)[0].msg, status: 0})
            }
        }).catch(err => {
//            res.render('error', {
//                error: err
//            });
            console.log(err);
            res.status(400).send({message: err.message, status: 0})
        });
// render view add institution page
    } catch (err) {
        console.log(err);
        res.status(400).send({message: err.message, status: 0})
    }
};

var editInstructionValidator = function (req, res, next) {
    req.checkBody('id', 'id is required').notEmpty()
    req.checkBody('previousInstruction', 'pre instruction is required').notEmpty()
    req.checkBody('newInstruction', 'new Instruction is required').notEmpty()
    return req.validationErrors(true)
}
exports.edit_instruction = (req, res, next) => {
    try {
//        let table = '<table class="table table-responsive-md"><input type="hidden" id="institute_id" value="{{id}}">{% set index = 1 %}{% for data in instructions %}<tr><td class="col-md-1">{{index}}<input type="hidden" value="{{data}}"></td><td class="col-md-8 content" editabl="true">{{data}}</td><td class="col-md-2"><span class="table-remove"><button type="button" class="btn btn-icon-only yellow edit"><i class="fa fa-edit"></i></button><button type="button" class="btn btn-icon-only red delete"><i class="fa fa-trash"></i></button></span></td></tr>{% set index = index + 1 %} {% endfor %}</table>';
        new Promise((resolve, reject) => {
            var errors = editInstructionValidator(req, res, next)
            if (!errors) {
                institutes.update({
                    _id: mongoose.Types.ObjectId(req.body.id),
                    status: 1,
                    is_deleted: 0,
                    instruction: req.body.previousInstruction.toString()
                }, {"instruction.$": req.body.newInstruction.toString()}).then(data => {
                    institutes.findOne({_id: mongoose.Types.ObjectId(req.body.id), status: 1, is_deleted: 0}, {instruction: 1}).then(data => {
                        res.status(200).send({message: "success", status: 1});
                    }).catch(error => {
                        console.log(error);
                        reject(error)
                    })
                }).catch(error => {
                    console.log(error)
                    reject(error)
                })
            } else {
                res.status(400).send({message: Object.values(errors)[0].msg, status: 0})
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({message: err.message, status: 0})
        });
// render view add institution page
    } catch (err) {
        console.log(err);
        res.status(400).send({message: err.message, status: 0})
    }
};

var addInstructionValidator = function (req, res, next) {
    req.checkBody('id', 'id is required').notEmpty()
    req.checkBody('instruction', 'instruction is required').notEmpty()
    return req.validationErrors(true)
}
exports.add_instruction = (req, res, next) => {
    try {
        let table = '<table class="table table-responsive-md"><input type="hidden" id="institute_id" value="{{id}}">{% set index = 1 %}{% for data in instructions %}<tr><td class="col-md-1"><span>{{index}}</span><input type="hidden" value="{{data}}"></td><td class="col-md-8 content">{{data}}</td><td class="col-md-2"><span class="table-remove"><button type="button" class="btn btn-icon-only yellow edit"><i class="fa fa-edit"></i></button><button type="button" class="btn btn-icon-only red delete"><i class="fa fa-trash"></i></button></span></td></tr>{% set index = index + 1 %} {% endfor %}</table>';
        new Promise((resolve, reject) => {
            var errors = addInstructionValidator(req, res, next)
            if (!errors) {
                institutes.update({
                    _id: mongoose.Types.ObjectId(req.body.id),
                    status: 1,
                    is_deleted: 0
                }, {$push: {instruction: req.body.instruction.toString()}}).then(data => {
                    institutes.findOne({_id: mongoose.Types.ObjectId(req.body.id), status: 1, is_deleted: 0}, {instruction: 1}).then(data => {
                        let template = swig.render(table, {locals: {instructions: data.instruction, id: data.id, }});
                        res.status(200).send({message: "success", data: template})
                    }).catch(error => {
                        console.log(error);
                        reject(error)
                    })
                }).catch(error => {
                    console.log(error)
                    reject(error)
                })
            } else {
                res.status(400).send({message: Object.values(errors)[0].msg, status: 0})
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({message: err.message, status: 0})
        });
// render view add institution page
    } catch (err) {
        console.log(err);
        res.status(400).send({message: err.message, status: 0})
    }
};