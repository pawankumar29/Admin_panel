var mongoose = require('mongoose');
// require mongoose models
var user = require('../models/user');
var email_template = mongoose.model('email_template');
var email_templates = require('../models/email_template.js');
var mails = require('../helper/send_mail.js');
var password_resets = require('../models/password_reset.js');
var swig = require('swig');
var env = require("../env");
var roles = require("../helper/roles");
// require nodemailer module for mail
var nodemailer = require('nodemailer');

// require passport-hash module for encrypt the password
var passwordHash = require('password-hash');

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


var template_json = require('../email_template_cms_pages'); // get email template json file

// create  smtp transport
var smtpTransport = nodemailer.createTransport(global.config.smtp);

var captchapng = require('captchapng');
var validcaptchacode = [];
var captchaImg = function () {
    var captcha_num = parseInt(Math.random() * 9000 + 1000);
    validcaptchacode.push(captcha_num.toString());

    setTimeout(function () {
        var index_temp1 = validcaptchacode.indexOf(captcha_num.toString());
        if (index_temp1 > -1) {
            validcaptchacode.splice(index_temp1, 1);
        }
    }, 300000);
    var p = new captchapng(130, 43, captcha_num); // width,height,numeric captcha
    p.color(255, 255, 255, 1); // First color: background (red, green, blue, alpha)
    p.color(30, 104, 21, 255); // Second color: paint/letters color (red, green, blue, alpha)
    p.color(203, 35, 42, 255); // Second color: paint (red, green, blue, alpha)
    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    return imgbase64;
};


/**
 * first login email 
 */

exports.get_login = (req, res, next) => {
    try {
        if (!req.user) {
            res.render('login_email', {title: 'Login', email: '', data: req.cookies, message: req.flash()});
        } else {
            res.redirect('/dashboard');
        }
    } catch (err) {
        console.log(err);
        res.render('error', {error: err});
    }
}

/**
 * admin authentication get page
 */
exports.get_auth = (req, res, next) => {
    try {
        let valicode = '';
        if (req.cookies.failed_attepmt >= 5) {
            valicode = new Buffer(captchaImg()).toString('base64');
        }
        res.render('login', {title: 'Login', data: req.cookies, email: req.cookies.temp_email, message: req.flash(), 'valicode': valicode});
    } catch (err) {
        console.log(err);
        res.render('error', {error: err});
    }

}

/**
 * admin post authentication check login attempts numbers
 */
exports.post_auth = (req, res, next) => {
    try {
        req.body.email = req.body.email.toLowerCase().trim();
        let query = {email: req.body.email, is_deleted: 0, status: 1, role: {$ne: roles.app_user}};
        user.findOne(query).then((user) => {
            if (user["status"] == 1) {
                res.cookie('temp_email', req.body.email);
                let valicode = '';
                if (req.cookies.failed_attepmt >= 5) {
                    valicode = new Buffer(captchaImg()).toString('base64');
                }
                res.render('login', {title: 'Login', data: req.cookies, email: req.body.email, message: req.flash(), 'valicode': valicode});
            } else {
                req.flash('error', 'There is no account currently associated with this e-mail');
                res.redirect('/login');
            }
        }).catch((error) => {
            req.flash('error', error.message);
            res.redirect('/login');
        })
    } catch (err) {
        console.log(err);
        res.render('error', {error: err});
    }
}


/**
 * post login verify captch and user authenticate
 */
exports.post_login = (req, res, next) => {
    new Promise((resolve, reject) => {
        if (req.cookies.failed_attepmt >= 5) {
            if (req.body.captcha) {
                let index_temp2 = validcaptchacode.indexOf(req.body.captcha);
                if (index_temp2 <= -1) {
                    validcaptchacode.splice(index_temp2, 1);
                    reject({message: "Entered captcha code is wrong"});
                }
            } else {
                reject({message: "Enter captcha code"});
                //throw Error('Enter captcha code');
            }
        }
        req.body.email = req.body.email.toLowerCase().trim();
        req.body.password = req.body.password.trim();
        let query = {email: req.body.email, is_deleted: 0, status: 1, role: {$ne: roles.app_user}};
        user.findOne(query).then((data) => {
            if (data.status == 1) {
                if (!passwordHash.verify(req.body.password, data.data.password)) {
                    if (req.cookies.failed_attepmt !== undefined) {
                        let val = parseInt(req.cookies.failed_attepmt) + 1;
                        resolve(val);
                    } else {
                        resolve(1);
                    }
                } else {
                    resolve(0);
                }
            } else {
                let val = parseInt(req.cookies.failed_attepmt) + 1;
                resolve(val);
            }
        }).catch((error) => {
            reject(error);
        });
    }).then((data) => {
        res.cookie('failed_attepmt', data);
        next();
    }).catch((error) => {
        req.flash('error', error.message);
        res.redirect('/authentication');
    });
}

/**
 * forgot password get
 */
exports.get_forgot_password = (req, res, next) => {

    try {
        res.render('forgot-password', {title: 'Forgot Password', message: req.flash()});
    } catch (err) {
        console.log(err);
        res.render('error', {error: err});
    }

}

/** 
 * forgot password post 
 */

exports.post_forgot_password = (req, res, next) => {
    new Promise((resolve, reject) => {
        let logo = '';
        req.body.email = req.body.email.toLowerCase().trim();
        // find data from database for confirmation
        let user_promise = user.findOne({email: req.body.email, role: {$ne: roles.app_user}, status: 1, is_deleted: 0});
//        let template_promise = email_template.findOne({type: template_json.forgot_password_admin, organisation_id: mongoose.Types.ObjectId()});
        let password_resets_promise = password_resets.remove({email: req.body.email});

        Promise.all([user_promise, password_resets_promise]).then(([userData, resetData]) => {
            if (userData["status"] != 1) {
                reject({'message': 'There is no account currently associated with this e-mail'});
            } else if (resetData == null) {
                reject({'message': 'reset password  does not work'});
            } else {
                email_template.findOne({type: template_json.forgot_password_admin, organisation_id: mongoose.Types.ObjectId(userData.data.organisation_id)}).then(templateData => {
                    if (templateData) {
                        let text = '';
                        let possible = '01234567898764321345679765433223456678786734523534675685689';
                        for (let i = 0; i < 12; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        let token1 = encrypt(userData.data._id + parseInt(text));
                        let expiry = new Date();
                        expiry.setMinutes(expiry.getMinutes() + 30);
                        password_resets.save({email: req.body.email, reset_token: token1, expiry: expiry}).then((pwdResetData) => {
                            if (pwdResetData["status"] == 1) {
                                let tpl_swig = swig.compileFile('public/mail_page/index.html');
                                let link = '<a href="' + env.adminUrl + 'reset-password/' + token1 + '">' + env.adminUrl + 'reset-password/' + token1 + '</a>';
                                let content = templateData.content;
                                let subject = templateData.subject;
                                content = content.replace('@email@', userData.data.email);
                                content = content.replace('@link@', link);
                                content = content.replace('@project_name@', global.config.project_name);
                                subject = subject.replace('@project_name@', global.config.project_name);
                                let tpl_admin = tpl_swig({content: content, logo_path: env.adminUrl + 'images/logo.png'});
                                mails.send(req.body.email, templateData.subject, tpl_admin);
                                req.flash('success', 'Reset link has been sent to your Email');
                                res.redirect('/login');
                            } else {
                                reject(pwdResetData);
                            }
                        })
                    } else {
                        reject({message: "template not found"});
                    }
                }).catch(error => {
                    throw error;
                });
        }
        }).catch((err) => {
            reject(err);
        })

    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/forgot-password');
    })

}


/** get reset password */
exports.get_reset_password = (req, res, next) => {
    try {
        let current_time = new Date();
        /* find password_reset record corresponding to token */
        password_resets.findOne({reset_token: req.params.id, expiry: {$gte: current_time}}).then((pwdResetData) => {
            if (pwdResetData) {
                res.render('reset-password', {userId: req.params.id, title: 'Reset Password', valid: 1, message: req.flash()});
            } else {
                res.render('reset-password', {userId: req.params.id, title: 'Reset Password', valid: 0, message: req.flash()});
            }
        }).catch((error) => {
            res.render('error', {error: error});
        });

    } catch (err) {
        console.log(err);
        res.render('error', {error: err});
    }

}

/**reset password post */

exports.post_reset_password = (req, res, next) => {

    new Promise((resolve, reject) => {
        var email;
        let current_time = new Date();
        req.body.password = req.body.password.trim();
        if (req.body.password == '' || req.body.password_confirmation == '') {
            reject({success: 0, message: 'There were some problem with your input.(Password field is required)'});
        }
        if (req.body.password !== req.body.password_confirmation) {
            reject({success: 0, message: 'The passwords you have entered do not match'});
        }

        if (req.body.password.length < 8) {
            reject({success: 0, message: 'Enter a authenticate password between 8 to 16 characters. Your password shoud include letters, numbers and special characters'});
        } else {
            /* find password_reset record corresponding to token */
            password_resets.findOne({reset_token: req.body.token, expiry: {$gte: current_time}}).then((pwdResetData) => {
                if (pwdResetData) {
                    email = pwdResetData.email;
                    req.body.password = passwordHash.generate(req.body.password);
                    /* update password corresponding to email coming from password-reset */
                    return user.findOneAndUpdate({email: pwdResetData.email, status: 1, is_deleted: 0}, {password: req.body.password});
                }
            }).then((userdata) => {
                let temp_id = template_json.password_changed;
                return email_template.findOne({type: temp_id, organisation_id: mongoose.Types.ObjectId(userdata.data.organisation_id), status: 1});
            }).then((template) => {
                if (template) {
                    var content = template.content;
                    content = content.replace('@name@', 'Admin');
                    content = content.replace('@project_name@', global.config.project_name);
                    mails.send(email, template.subject, content);
                    req.flash('success', 'Password updated successfully');
                    password_resets.remove({reset_token: req.body.token});
                    res.redirect('/login');
                } else {
                    reject({message: "template not found"});
                }
            }).catch((error) => {
                reject({success: 0, message: error.message});
            })
        }
    }).catch((error) => {
        if (error.success === 0) {
            req.flash('error', error.message);
            res.redirect('/reset-password/' + req.params.id);
        } else {
            console.log(error);
            res.render('error', {error: error});
        }
    })


}




