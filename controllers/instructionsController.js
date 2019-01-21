const institutes = require('../models/institutes')
const moment = require('moment')
    // const mails = require('../helper/send_mail.js');
    // const email = require('../email_template_cms_pages');
const email_templates = require('../models/email_template.js')
const mongoose = require('mongoose')
const settings = require('../models/settings')

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

exports.edit_instruction = (req, res, next) => {
    try {
        new Promise((resolve, reject) => {
            console.log(" id ");
            console.log(req.body.id)
            console.log("instruction");
            console.log(req.body.instruction);
            institutes
                .update({
                    _id: mongoose.Types.ObjectId(req.body.id),
                    status: 1,
                    is_deleted: 0
                }, {
                    $pull: {
                        instruction: {
                            $eq: req.body.instruction
                        }
                    }
                })
                .then(data => {
                    console.log(data);
                    res.status(200).send({
                        message: "success",
                        status: 0
                    });
                })
                .catch(error => {
                    consol.log(error)
                    reject(error)
                })
        }).catch(err => {
            res.render('error', {
                error: err
            });
        });
        // render view add institution page
    } catch (err) {
        res.render('error', {
            error: err
        });
    }
};