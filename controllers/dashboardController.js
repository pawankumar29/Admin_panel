var users = require('../models/user');

//var settings = require('../models/setting');
var contact = require('../models/contact');
var otp_generate = require('../helper/otp_generate');
var mails = require('../helper/send_mail');
var email = require('../email_template_cms_pages');
var email_templates = require('../models/email_template');
var passwordHash = require('password-hash'); // require passport-hash module for encrypt the password




/* GET method for dashboard */
exports.dashboard_get = (req, res, next) => {
    new Promise((resolve, reject) => {
        let user_count = 0;
        let contact_us_count = 0;
        let promise1 = users.count({
            type: {$ne: 1},
            status: {$ne: 2},
            is_phone_verified: 1,
            is_deleted: 0
        });
        let promise2 = contact.find_count({});
        Promise.all([promise1, promise2]).then(([ user_data, contact_us_data ]) => {
            if (user_data.status === 1) {
                user_count = user_data.data;
            }
            if (contact_us_data.status === 1) {
                contact_us_count = contact_us_data.data;
            }
            res.render('dashboard', {
                active: 'dashboardpage',
                title: 'Dashboard',
                users: user_count,
                contact_us: contact_us_count,
            });
        });
    }).catch(err => {
        console.log(err);
        res.render('error', {error: err});
    });
}
//
///*dashboard get profile */
exports.get_profile = (req, res, next) => {

    try {
        // find user by id that exists in user session       
        users.findOne({_id: req.session.passport.user}).then((result) => {

            res.render('profile', {id: req.session.passport.user, title: 'Edit Profile', user: result.data, message: req.flash()});

        }).catch((error) => {
            res.render('error', {error: error});
        })

    } catch (err) {
        res.render('error', {error: err});
    }
}


///**dashboard post profile */
exports.post_profile = (req, res, next) => {
    try {

        if (req.body.name) {
            req.body.name = req.body.name.trim();
        }
        // update user profile
        users.update({_id: req.session.passport.user}, req.body).then((result) => {
            req.flash('success', 'Profile is Updated');
            res.redirect('/dashboard/profile');
        }).catch((error) => {
            req.flash('error', error);
            res.redirect('/dashboard/profile');
        });


    } catch (err) {
        res.render('error', {error: err});
    }
}

/** get changed password*/
exports.change_password_get = (req, res, next) => {
    try {
        res.render('changePassword', {title: 'Change Password', message: req.flash()});
    } catch (err) {
        res.render('error', {error: err});
    }
}

/** post changed password] */
exports.change_password_post = (req, res, next) => {
    new Promise((resolve, reject) => {
        var actual = req.user.password.trim(); // from session
        req.body.newPassword = req.body.newPassword.trim();
        req.body.confirmPassword = req.body.confirmPassword.trim();
        if (req.body.newPassword === req.body.confirmPassword) {
            if (passwordHash.verify(req.body.currentPassword, actual)) {
                // encrypt new password with password-hash
                req.body.newPassword = passwordHash.generate(req.body.newPassword);
                // update user password
                users.update({_id: req.user.id}, {password: req.body.newPassword}).then((result) => {
                    resolve(1)

                }).catch((error) => {
                    reject(error);

                })

            } else {
                reject({success: 0, message: 'Current password is wrong.Try again'})

            }
        } else {
            reject({success: 0, message: 'New password and confirm password must be same'})
        }
    }).then((result) => {
        req.flash('success', 'Password updated successfully');
        res.redirect('/dashboard/changePassword');
    }).catch((error) => {
        console.log(error);
        if (error.success === 0) {
            req.flash('warning', error.message);
            res.redirect('/dashboard/changePassword');
        } else {
            res.render('error', {error: error});
        }

    });

}

//setting get
exports.setting_get = (req, res, next) => {
    new Promise((resolve, reject) => {
        let settingData = [];
        settings.find().then(settings_data => {
            if (settings_data.status === 1) {
                settingData = settings_data.data;
            }
            res.render('settings', {title: 'Settings', message: req.flash(), response: settingData});
        });
    }).catch(err => {
        console.log(err);
        res.render('error', {error: err.message});
    });

}

/**check setting post*/
exports.setting_post = (req, res, next) => {

    new Promise(() => {
        settings.update({}, req.body).then(settingUpdate => {
            if (settingUpdate.status !== 1) {
                settings.save(req.body).then(settingSave => {
                    if (settingSave.status !== 1) {
                        return next(new Error(settingSave.message));
                    }
                });
            }
            req.flash('success', 'Settings has been updated successfully');
            res.redirect('/dashboard/settings');
        });
    }).catch(err => {
        res.render('error', {error: err});
    });

}

/** send otp on email */
exports.send_otp_post = (req, res, next) => {
    new Promise((resolve, reject) => {
        req.body.temp_email = req.body.temp_email.toLowerCase().trim();
        if (!req.body.temp_email) {
            reject({message: 'Please enter the email.'});
        } else if (req.user.email === req.body.temp_email) {
            reject({message: 'Oops! Looks like this is your current email id.'});
        }
        users.findOne({email: req.body.temp_email, is_deleted: 0, status: {$ne: 2}}).then((user_find) => {
            if (user_find.status !== 1) {
                var temp_id = email.otp_verification;
                return email_templates.findOne({_id: temp_id});
            } else {
                return reject(Error('Email already exist.'));
            }
        }).then((template) => {
            if (template.status === 1) {
                var otp_code = otp_generate.makeCode();
                var otp_expiry = new Date();
                otp_expiry.setMinutes(otp_expiry.getMinutes() + 30);

                var content = template.data.content;
                content = content.replace('@name@', req.user.firstName);
                content = content.replace('@otp_code@', otp_code);
                mails.send(req.user.email, template.data.subject, content);
                return users.update({_id: req.user._id}, {otp_code: otp_code, otp_expiry: otp_expiry, temp_email: req.body.temp_email});

            } else {
                return reject(Error(template.message));
            }
        }).then((user_update) => {

            if (user_update.status === 1) {
                res.send({message: 'OTP sent successfully.', status: 1}); //check
            } else {
                return reject(Error(user_update.message));
            }

        }).catch((error) => {

            reject(error);
        });

    }).catch((err) => {
        res.send({message: err.message, status: 0});
    });

}

/** Resend otp  */
exports.resend_otp_get = (req, res, next) => {

    new Promise((resolve, reject) => {
        // to generate random verification code
        let otp_code = otp_generate.makeCode();
        let otp_expiry = new Date();
        otp_expiry.setMinutes(otp_expiry.getMinutes() + 30);
        let temp_id = email.otp_verification;
        let template_promise = email_templates.findOne({_id: temp_id});
        let user_update_promise = users.update({_id: req.user._id}, {otp_code: otp_code, otp_expiry: otp_expiry});
        Promise.all([template_promise, user_update_promise]).then(([template, user_update]) => {
            if (template.status === 1) {
                let content = template.data.content;
                content = content.replace('@name@', req.user.firstName);
                content = content.replace('@otp_code@', otp_code);
                mails.send(req.user.email, template.data.subject, content);
            }
            if (user_update.status === 1) {
                res.send({message: 'OTP sent successfully. Please enter the new OTP.', status: 1, otp_code: otp_code});
            } else {
                return reject(Error(user_update.message));
        }
        }).catch((err) => {
            reject(err);
        })
    }).catch(err => {
        res.send({message: err.message, status: 0});
    });


}