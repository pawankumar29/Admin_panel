var express = require('express');
var router = express.Router();
var users = require('../models/user.js');
// var Sync = require('sync');
var mails = require('../helper/send_mail');
var email = require('../email_template_cms_pages');
var email_templates = require('../models/email_template');
var mongoose = require("mongoose");
const moment = require("moment");
const env = require("../env");
// Nodejs encryption with CTR
var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'd6F3Efeq';

// function for encrypt the text
function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

// route for verify a user otp
router.post('/', function (req, res, next) {
    new Promise((resolve, reject) => {
        var temp_email, user_id, email_id, timeStamp, link;
        let current_date = new Date();
        users.findOne({_id: req.user._id, status: 1, is_deleted: 0}).then((user_data) => {
            if (user_data.status === 1) {
                if (user_data.data.otp_code != req.body.otp_code) {
                    reject({message: 'You have entered the wrong OTP.', status: 0});
                } else if (moment(user_data['data']["otp_expiry"]).isBefore(current_date)) {
                    reject({message: 'Your Otp has been expired.', status: 0});
                } else {
                    temp_email = user_data.data.temp_email;
                    if (user_data.data.temp_email)
                        user_id = encrypt(user_data.data._id.toString());
                    email_id = encrypt(user_data.data.email.toString());
                    timeStamp = Math.floor(Date.now());
                    return users.update({_id: mongoose.Types.ObjectId(req.user._id)}, {latest_token: timeStamp.toString()});
                }
            } else {
                throw Error('Invalid user');
            }
        }).then((user_updated) => {
            if (user_updated.status == 1) {
                var temp_id = email.email_confirmation;
                return email_templates.findOne({type: temp_id, status: 1, organisation_id: req.user.organisation_id});
            } else {
                reject({message: "Data can't be updated", status: 0});
            }
        }).then((template) => {
            if (template.status === 1) {
                link = env.adminUrl + 'email_verification/' + user_id + '/' + email_id + '_' + timeStamp;
                var subject = template.data.subject;
                var content = template.data.content;
                content = content.replace('@name@', req.user.name);
                content = content.replace('@link@', link);
                content = content.replace('@project_name@', global.config.project_name);
                subject = subject.replace('@project_name@', global.config.project_name);
                mails.send(temp_email, subject, content);
                res.send({message: 'Link sent to email', status: 1});
            } else {
                reject({message: "Email template not exist", status: 0});
            }
        }).catch((error) => {
            reject(error)
        });
    }).catch((err) => {
        res.send({message: err.message, status: 0});
    })
});

module.exports = router;
