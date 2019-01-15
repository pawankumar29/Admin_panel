var notification = require('../models/notification');
var mongoose = require('mongoose');
var util = require('util');

/**Get notification listing */
exports.get_notification_list = (req, res, next) => {
    new Promise((resolve, reject) => {
//        console.log("notification hit")
        let admin_id = mongoose.Types.ObjectId(global.admin);
        let aggregation_query = [
            {$match: {"is_deleted": 0, "to": admin_id, "type": 8}},
            {$project: {"is_read": 1, "created_at": 1, "updated_at": 1, "status": 1, from: 1, to: 1}},
            {"$lookup": {
                    from: "users",
                    let: {ref_id: "$from"},
                    pipeline: [
                        {
                            $match:
                                    {
                                        $expr:
                                                {
                                                    $and:
                                                            [
                                                                {$eq: ["$_id", "$$ref_id"]},
                                                            ]
                                                }
                                    }
                        },
                        {$project: {email: 1, firstName: 1, lastName: 1}}
                    ],
                    as: "user"
                }
            },
            {
                "$unwind": {
                    "path": "$user",
                    "preserveNullAndEmptyArrays": false
                }
            },
        ];
        notification.aggregate(aggregation_query).then((result) => {
            res.send(result);
        }).catch(error => {
            throw error;
        });
    }).catch((err) => {
        res.render("error", {error: err});
    })
}

//set unread to read
exports.update_notification_status = (req, res, next) => {
    new Promise((resolve, reject) => {
        let id = mongoose.Types.ObjectId(req.params.id);
        notification.find_with_update({_id: id}, {is_read: 1, is_deleted: 0}).then((result) => {
            if (result.status == 1) {
                // let contact_us_id = mongoose.Types.ObjectId(result.data.reference_id.toString()) ;
                res.redirect('/contact_us/');
            } else {

                reject({"status": 0, "message": result.message});
            }

        }).catch((err) => {
            reject(err);
        });
    })
            .catch((err) => {
                res.render("error", {error: err});
            })

}

//update all unread
exports.update_all_to_read = (req, res, next) => {
    new Promise((resolve, reject) => {
        let id = mongoose.Types.ObjectId(req.params.id);
        notification.update_many({is_read: 0, is_deleted: 0, type: 8}, {is_read: 1}).then((result) => {

            if (result.status == 1) {

                res.send({status: 1, message: "updated successfully"});
            } else {

                reject({"status": 0, "message": result.message});
            }

        }).catch((err) => {
            reject(err);
        });
    })
            .catch((err) => {
                res.render("error", {error: err});
            })

}


