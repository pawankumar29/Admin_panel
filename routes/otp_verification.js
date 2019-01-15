var express = require('express');
var router = express.Router();
var users = require('../models/user.js');
// var Sync = require('sync');
var mails = require('../helper/send_mail');
var email = require('../email_template_cms_pages');
var email_templates = require('../models/email_template');
var mongoose = require("mongoose");
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
        users.findOne({_id: req.user._id}).then((user_data) => {
            if (user_data.status === 1) {
                if (user_data.data.otp_code == req.body.otp_code) {
                    temp_email = user_data.data.temp_email
                    return users.findOne({_id: req.user._id, otp_code: req.body.otp_code, otp_expiry: {$gte: current_date}});
                } else {
                    //res.send({ message: 'You have entered the wrong OTP.', status: 0 });
                    reject({message: 'You have entered the wrong OTP.', status: 0});
                }

            } else {
                throw Error('Invalid user');
            }
        }).then((check_otp_expire) => {

            if (check_otp_expire.status === 1) {
                return users.findOne({temp_email: temp_email});
            } else {
                reject({message: 'Otp has been expired', status: 0});
            }
        }).then((userFind) => {
            if (userFind.status != 0) {
                // encrypt user id and email
                user_id = encrypt(userFind.data._id.toString());
                email_id = encrypt(userFind.data.email.toString());
                timeStamp = Math.floor(Date.now());
                return users.update({_id: mongoose.Types.ObjectId(req.user._id)}, {latest_token: timeStamp.toString()});
            } else {
                console.log(userFind);
//                reject({ message: 'Otp has been expired', status: 0 });
            }
        }).then((user_updated) => {
            console.log("user_updated");
            console.log(user_updated);
            if (user_updated.status == 1) {
                var temp_id = email.email_confirmation;
                return email_templates.findOne({_id: temp_id});
            } else {
                reject({message: "Data can't be updated", status: 0});
            }


        }).then((template) => {
            if (template.status === 1) {
                link = env.adminUrl + 'email_verification/' + user_id + '/' + email_id + '_' + timeStamp;
                var content = template.data.content;
                content = content.replace('@name@', req.user.firstName);
                content = content.replace('@link@', link);
                mails.send(temp_email, template.data.subject, content);
                res.send({message: 'Link sent to email', status: 1});
            } else {
                reject({message: "email not exist", status: 0});
            }
        }).catch((error) => {
            reject(error)

        });

    }).catch((err) => {
        res.send({message: err.message, status: 0});
    })

});

module.exports = router;
