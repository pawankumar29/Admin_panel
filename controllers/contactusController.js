

// var mongoose = require('mongoose');
// var contact_us = mongoose.model('contact_us');
var contact_us = require('../models/contact');

// var mails = require('../helper/send_mail.js');
var moment = require('moment');
var monenttz = require('moment-timezone');
var util = require('util');
var mongoose = require('mongoose');
var contact = mongoose.model('contact_us');



/** listing of queries */
exports.get_query_list = function (req, res, next) {
    new Promise((resolve, reject) => {
        // make global variable options for paginate method parameter
        var options = {
            perPage:  global.pagination_limit,
            delta: global.delta,
            page: 1
        };
        /** ***condition for not deleted clients*****/
        var condition = {};
        var sortCondition = {};
        /** ***fetch conditions*****/
        if (req.query.search_by) {
            req.query.search_by = req.query.search_by.trim();
            var search_by = new RegExp('.*' + req.query.search_by + '.*', 'i');
            condition.$or = [{ 'user.email': search_by }, { 'user.firstName': search_by }, { 'user.lastName': search_by }];
        }
        // if (req.query.selected_date && req.query.status) {

        // }

        if (req.query.selected_date) {
            var dates = req.query.selected_date.split('-');
            var start_date = new Date(moment(dates[0]).utcOffset(req.cookies.time_zone_offset).format('MM/DD/YYYY HH:mm') + 'Z');
            var end_date = new Date(moment(dates[1] + ' 23:59:59').utcOffset(req.cookies.time_zone_offset).format('MM/DD/YYYY HH:mm') + 'Z');
            //  condition.created_at = { $gte: start_date, $lte: end_date };
            condition.$and = [{ created_at: { $gte: start_date } }, { created_at: { $lte: end_date } }];
        }
        if (req.query.status && req.query.status != "all") {
            condition.status = parseInt(req.query.status)
        }
        if (!req.query.sort_field) {
            sortCondition.created_at = -1;
        }
        /** ***pagination check*****/
        if (req.query.page) {
            options.page = req.query.page;
        }
        /** ***skip check*****/
        // let skipRecords = options.page - 1;
        // let populate = { path: 'subject', select: 'name', model: "contact_category" };
        //populate({ path: 'fans', select: 'name' })
        /* let populate = 'subject'; */
        // find users

        let aggregation_condition = [

            {
                "$lookup": {
                    "from": "contact_categories",
                    "localField": "subject",
                    "foreignField": "_id",
                    "as": "contact"
                }
            },
            {
                "$unwind": {
                    "path": "$contact",
                    "includeArrayIndex": "arrayIndex",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {
                "$unwind": {
                    "path": "$user",
                    "includeArrayIndex": "arrayIndex",
                    "preserveNullAndEmptyArrays": false
                }
            },
//            {
//                "$match": { 'user.is_deleted': { $eq: 0 } }
//            },


            {
                "$project": {
                    "user.email": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "user.firstName": 1,
                    "user.lastName": 1,
                    "contact.name": 1,
                    "message": 1,
                    "status": 1

                }
            },
            
            {
                "$match": condition
            },
            {
                "$sort": sortCondition
            }
        ];
        var options_agg = { page: 1, limit: 10 };

        if (req.query.page) {
            options_agg.page = parseInt(req.query.page);
        }

        var aggregation_condition_data = contact.aggregate(aggregation_condition);
//        console.log("aggregation_condition_data");
//        console.log(aggregation_condition_data);

        contact.aggregatePaginate(aggregation_condition_data, options_agg)
            .then(function (results) {
//                console.log("req.cookies.time_zone_offset")
//                console.log(req.cookies.time_zone_offset)
                for (let i = 0; i < results.data.length; i++) {
//                    console.log(results.data[i].created_at );
                    results.data[i].created_at = monenttz.tz(results.data[i].created_at , req.cookies.time_zone_offset).format('DD-MM-YYYY hh:mm A');
                    //     contact_data.results[i].subject = contact_data.results[i].subject.name;
//                    console.log(results.data[i].created_at );
                }
//                console.log("aggregation_condition_data")
//                console.log(results)

                var pageCount = results.pageCount;
                var count = results.totalCount;
                // results = JSON.parse(JSON.stringify(results).replace(/null/ig, ""));
                var response = {};
                response.results = results;
                response.count = count;
                response.last = pageCount;
                // for search query
                if (req.query.page | req.query.search) {
                    response.current = parseInt(req.query.page || 1);

                    if (response.current > 1) {
                        response.prev = response.current - 1;
                    } else {
                        response.prev = response.current;
                    }
                    var pages = [];
                    if (pageCount <= 3) {
                        for (let i = 1; i <= pageCount; i++) {
                            pages.push(i);
                        }
                    } else {
                        for (let i = response.prev; i <= response.next; i++) {
                            pages.push(i);
                        }
                    }
                    response.pages = pages;
                    if (response.current < pageCount) {
                        response.next = response.current + 1;
                    } else {
                        response.next = response.current;
                    }
                    res.render('contact_us/search', { response: response });
                } else {
                    response.current = 1;
                    response.prev = 1;
                    let pages = [];

                    if (pageCount <= 3) {
                        for (let i = 1; i <= pageCount; i++) {
                            pages.push(i);
                        }
                    } else {
                        for (var i = response.prev; i <= response.next; i++) {
                            pages.push(i);
                        }
                    }
                    response.pages = pages;
                    if (response.current < pageCount) {
                        response.next = response.current + 1;
                    } else {
                        response.next = response.current;
                    }

//                    console.log('response');
//                    console.log((util.inspect(response, { depth: null })));
                    res.render('contact_us/contact_list', {
                        response: response,
                        message: req.flash(),
                        title: 'Manage Queries',
                        active: 'contact_us'
                    });
                }
            })
            .catch(function (err) {
//                console.log(err);
                if (req.query.search) {
                    return res.render('contact_us/search', { response: [] });
                } else {
                    return res.render('contact_us/search', {
                        response: [],
                        message: req.flash(),
                        title: 'Reviews',
                        active: 'contact_us'
                    });
                }
            })
    }).catch((err) => {
        console.log(err);
        res.render("error", { error: err });
    })
}
//get query details
exports.get_query_details = function (req, res, next) {
    new Promise((resolve, reject) => {
//        console.log("inside viewww......")
        var id = mongoose.Types.ObjectId(req.params.id.toString());
//        console.log(id);
        let aggregation_condition = [
            {
                "$match": { "_id": id }
            },
            {
                "$lookup": {
                    "from": "contact_categories",
                    "localField": "subject",
                    "foreignField": "_id",
                    "as": "contact"
                }
            },
            {
                "$unwind": {
                    "path": "$contact",
                    "includeArrayIndex": "arrayIndex",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {
                "$unwind": {
                    "path": "$user",
                    "includeArrayIndex": "arrayIndex",
                    "preserveNullAndEmptyArrays": false
                }
            },
//            {
//                "$match": { "user.is_deleted": {$eq : 0} }
//            },

            {
                "$project": {
                    "user.email": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "user.firstName": 1,
                    "user.lastName": 1,
                    "contact.name": 1,
                    "message": 1,
                    "status": 1

                }
            }


        ];
        contact_us.aggregate(aggregation_condition).then((data) => {
            if (data.status == 1) {
//                console.log("data_detail.....")
//                console.log(data);
                data.data[0].created_at =  monenttz.tz(data.data[0].created_at , req.cookies.time_zone_offset).format('DD-MM-YYYY hh:mm A');
//                console.log("data================");
//                console.log(data);
                /*  data.subject = data.subject.name; */
                res.send({ "query_data": data, "status": 1 });
            } else {
                req.flash('error', 'Query does not exists');
                res.send({ "status": 0 });
            }
        }).catch((err) => {
            reject(err);
        });

    }).catch((err) => {
        res.render('error', { error: err });
    })
}
//delete query 
exports.delete_query = (req, res, next) => {
    new Promise((resolve, reject) => {
        // delete contact us request
        contact_us.remove({ _id: { $in: req.params.id } }).then((data) => {
            if (data.status == 1) {
                req.flash('success', 'Query has been deleted successfully');
                res.redirect('/contact_us');
            } else {

                req.flash('error', 'Query has been not deleted');
                res.redirect('/contact_us');
            }
        }).catch((err) => {
            reject(err);
        })

    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/contact_us');
    })
}
//mark the query as resoved
exports.update_query_resolved = (req, res, next) => {
    new Promise((resolve, reject) => {
        // update contact us request
        var id = mongoose.Types.ObjectId(req.params.id.toString());
        contact_us.update({ _id: id }, { status: 1 }).then((data) => {
            if (data.status == 1) {
                req.flash('success', 'Query has been resolved successfully');
                res.redirect('/contact_us');
            } else {

                req.flash('error', 'Query has been not updated');
                res.redirect('/contact_us');
            }
        }).catch((err) => {
            reject(err);
        })

    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/contact_us');
    })
}