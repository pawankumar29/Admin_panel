var express = require('express');
var router = express.Router();
var users = require('../models/user.js');
// var Sync = require('sync');


// Nodejs encryption with CTR
var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'd6F3Efeq';

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

// route for verify a user
router.get('/:id/:email_timestamp', function (req, res, next) {
    var obj = {};
    new Promise((resolve, reject) => {
        var userId = decrypt(req.params.id);
        var email_timestamp = req.params.email_timestamp.split('_');
        var emailId = decrypt(email_timestamp[0].split("/")[0]);
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            // userId = mongoose.Types.ObjectId(userId);
            users.findOne({_id: userId, email: emailId, latest_token: email_timestamp[1]}, {}).then((user_data) => {
                if (user_data.status === 1) {
                    // update user to verified
                    obj.message = "Your email has been changed successfully.";
                    obj.show_return = 1;
                    return users.update({_id: userId}, {email: user_data.data.temp_email, temp_email: '', latest_token: ''})

                } else {
                    obj.message = 'Oops! Your verification link has been expired.';
                    obj.show_return = 0;
                    //res.render('email_verified', { message: 'Oops! Your verification link has been expired.', show_return: 0 });
                }
            })
                    .then((result) => {

                        res.render('email_verified', obj);
                    })
                    .catch((error) => {
                        reject(error);
                    })

        } else {
            reject({status: 0, message: 'Oops! Something went wrong.'});
        }

    }).catch((error) => {
        console.log(error);
        res.render('email_verified', {message: 'Oops! Something went wrong.'});
    });

})

module.exports = router;
