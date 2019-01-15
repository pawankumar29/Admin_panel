"use strict";
const Promise = require('bluebird');
const users = require('../models/user.js');
const moment = require('moment');
const mails = require('../helper/send_mail.js');
const email = require('../email_template_cms_pages');
const email_templates = require('../models/email_template.js');
const mongoose = require("mongoose");
/** get user listing */
exports.get_users = (req, res, next) => {
    new Promise((resolve, reject) => {
// make global variable options for paginate method parameter
        let options = {
            perPage: global.pagination_limit,
            delta: global.delta,
            page: 1
        };
        /** ***condition for not deleted users*****/
        let condition = {
            type: {$ne: 1},
            status: {$ne: 2},
            is_phone_verified: 1,
            is_deleted: 0
        };
        let sortCondition = {created_at: -1};
        /** ***fetch conditions*****/
        var searchby = req.query.search_by;
        if (searchby) {
            if (searchby.charAt(0) === '+') {
                searchby = searchby.slice(1);
            }
            searchby = searchby.trim();
            let search_array = searchby.split(' ');
            if (search_array.length === 1) {
                var search_by = new RegExp('.*' + searchby + '.*', 'i');
                condition.$or = [{firstName: search_by}, {lastName: search_by}, {email: search_by}];
            } else {
                let firstName = new RegExp(search_array[0], 'i');
                let lastName = new RegExp('.*' + search_array[1] + '.*', 'i');
                condition.$and = [{firstName: firstName}, {lastName: lastName}, {email: search_by}];
            }
        }
        
        /** add conditons if gender and status is added */
        
        if (req.query.status && req.query.gender) {
            if (req.query.status != "all") {
                condition.status = req.query.status;
            }
            if (req.query.gender != "all") {
                condition.gender = req.query.gender;
            }
        } else if (req.query.status) {
            if (req.query.status != "all") {
                condition.status = req.query.status;
            }
        } else if (req.query.gender) {
            if (req.query.gender != "all") {
                condition.gender = req.query.gender;
            }
        }
        
        
        
        /** ***pagination check*****/
        if (req.query.page) {
            options.page = req.query.page;
        }
        /** ***skip check*****/
        let skipRecords = options.page - 1;
        let projection = {
            firstName: 1,
            lastName: 1,
            gender: 1,
            email: 1,
            phone: 1,
            country_code: 1,
            type: 1,
            status: 1,
            created_at: 1,
            is_deleted: 1
        };
        let population = [];
        users.find_with_pagination_projection(
                condition,
                projection,
                population,
                sortCondition,
                options.perPage * skipRecords,
                options.perPage,
                options).then((user_data) => {
            
            if (user_data.status === 1) {
                let userData = user_data.data;
                // for search query
                if (req.query.page || req.query.search) {
                    res.render('users/search', {response: userData});
                } else // for simple query
                {
                    res.render('users/usersList', {
                        response: userData,
                        message: req.flash(),
                        title: 'Manage Users',
                        delta: 4,
                        active: 'user_page'
                    });
                }
            } else {
                res.redirect('/users');
            }
        });
    }).catch(err => {
        res.redirect('/users');
    });
};
/**get user details */
exports.get_user_detail = (req, res, next) => {
    new Promise((resolve, reject) => {
        let id = req.params.id;
        users.findOne({_id: id, is_deleted: 0}).then((user_data) => {
            if (user_data.status === 1) {
                let userDetailData = JSON.parse(JSON.stringify(user_data.data));
//                console.log("user_data");
//                console.log(userDetailData);
                
                // userDetailData.created_at = moment(userDetailData.created_at).utcOffset(parseInt(req.cookies.time_zone_offset)).format(global.timeformat);
                if (userDetailData.dob) {
                    userDetailData.dob = moment(userDetailData.dob);
                }
// res.render('users/userDetail', {message: req.flash(), back_url: req.query.refer, userDetailData: userDetailData, title: 'User Detail', active: 'user_page'});
                res.send({status: 1, message: req.flash(), back_url: req.query.refer, userDetailData: userDetailData, title: 'User Detail', active: 'user_page'});
            } else {
                res.send({status: 0});
            }
        });
    }).catch(err => {
        console.log(err);
        res.render('error', {error: err});
    });
};
/**enable/disable user */
exports.post_disable_user = (req, res, next) => {
    new Promise((resolve, reject) => {
        let id = req.body.userId;
        var status = req.body.status;
        let remarks = req.body.disable_reason;
        users.findOne({_id: id, is_deleted: 0}).then(client_data => {
            var token = client_data["data"]["device_token"];
            if (client_data.status === 1) {
                var user_status;
                if (status == 1) {
                    user_status = 'Activated';
                }
                
                if (status == 0) {
                    user_status = 'Inactivated';
                }
                
                
                let temp_id = email.enable_disable_user;
                email_templates.findOne({_id: temp_id}).then(template => {
                    if (template.status === 1) // && client_data.data.is_email_verified === 1
                    {
                        
                        var content = template.data.content;
                        content = content.replace('@name@', client_data.data.firstName);
                        content = content.replace('@status@', user_status);
                        content = content.replace('@remarks@', remarks);
                        let subject = template.data.subject;
                        subject = subject.replace('@status@', user_status);
                        mails.send(client_data.data.email, subject, content);
                    }
                    users.update({_id: id}, {$set: {status: req.body.status, device_token: ""}}).then(() => {
                        if (status == 0) {
                            if (client_data["data"]["push_notification"] == 1) {
                                let data = {};
                                data["body"] = global.push_messages.accountDisabledByAdmin;
                                data["type"] = 10
                                notification.send_notification(token, data);
                            }
                        }
                        req.flash('success', 'User has been ' + user_status + ' successfully');
                        res.send({'status': 1});
                    });
                });
            } else {
                res.send({'status': 0, message: client_data.message});
            }
        });
    }).catch(err => {
        console.log(err);
        res.send({'status': 0, message: err.message});
    });
};
//delete faqs
exports.delete_user = (req, res, next) => {
    new Promise((resolve, reject) => {
//        var id = mongoose.Types.ObjectId(req.params.id);
//        console.log(id);
//                users.findOneAndUpdate({_id: id, is_deleted: 0}, {device_token: "", status: 0, is_deleted: 1}).then(resuser => {
//                    if (resuser.status == 1) {
////delete checkin
//                        Promise.all([p1, p2, p3, p4, p5]).then(([rescheckin, resstories, resplacequestion, resfavourite, resuserconnection]) => {
//                            if (userDetail["data"]["push_notification"] == 1) {
//                                let data = {};
//                                data["type"] = 10
//                                data["body"] = global.push_messages.accountDeletedByAdmin;
//                                notification.send_notification(token, data);
//                            }
//                            let temp_id = email.delete_account;
//                            email_templates.findOne({_id: temp_id}).then(template => {
//                                if (template.status === 1) // && client_data.data.is_email_verified === 1
//                                {
//                                    var content = template.data.content;
//                                    content = content.replace('@name@', resuser.data.firstName);
//                                    let subject = template.data.subject;
//                                    mails.send(resuser.data.email, subject, content);
//                                }else{
//                                    console.log(template);
//                                }
//                                req.flash('success', 'User deleted successfully.');
//                                res.redirect('/users');
//                            });
//                        }).catch(error => {
//                            console.log(error);
//                            throw error;
//                        });
//                    } else {
//                        throw resuser;
//                    }
//                    
//                }).catch((error) => {
//                    throw error;
//                });
//            } else {
//                throw userDetail;
//            }
//        }).catch(error => {
//            throw error;
//        });
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Some error has occurred while deleting user');
//        res.render('error', {error: err});
        res.redirect('/users');
    })
}




// router.post('/search_by', function (req, res, next) {
//     Sync(function () {
//         try {
//             var name = new RegExp('.*' + req.body.name + '.*', 'i');
//             var user_data = users.find_with_projection.sync(null, {
//                 $or: [
//                     { first_name: name },
//                     { last_name: name },
//                     { email: name }
//                 ]
//             }, { first_name: 1, last_name: 1, email: 1, phone: 1 });
//             if (user_data.status === 1) {
//                 var data = user_data.data;
//                 var id_array = new Array();
//                 for (var i = 0; i < data.length; i++) {
//                     id_array.push((data[i].first_name + ' ' + data[i].last_name).toString());
//                     id_array.push((data[i].email).toString());
//                     id_array.push((data[i].phone).toString());
//                 }

//                 Array.prototype.contains = function (v) {
//                     for (var i = 0; i < this.length; i++) {
//                         if (this[i] === v) { return true; }
//                     }
//                     return false;
//                 };
//                 Array.prototype.unique = function () {
//                     var arr = [];
//                     for (var i = 0; i < this.length; i++) {
//                         if (!arr.contains(this[i])) {
//                             arr.push(this[i]);
//                         }
//                     }
//                     return arr;
//                 };
//                 var duplicates = id_array;
//                 var uniques = duplicates.unique(); // result = [1,3,4,2,8]
//                 res.send(uniques);
//             } else {
//                 res.send([]);
//             }
//         } catch (err) {
//             req.flash('error', err.message);
//             res.redirect('/users');
//         }
//     });
// });


