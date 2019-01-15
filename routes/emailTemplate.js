var express = require('express');
var router = express.Router();
var controller = require('../controllers/emailTemplateController');
/* var mongoose = require('mongoose');
// require mongoose models
var email_template = mongoose.model('email_template');
var email_template_attributes = mongoose.model('email_template_attributes'); */

// Get method for add template
router.get('/add',controller.get_add_template);


// Get method for List and search Template
router.get('/', controller.get_templates);

// Post method for add template
router.post('/', controller.post_add_template);


// Get method for update template
router.post('/edit', controller.post_edit_template);

// Get method for update template
router.get('/edit',controller.get_edit_template);
/* 
router.post('/search_by', function (req, res, next) {
    var name = new RegExp('.*' + req.body.name + '.*', 'i');
    email_template.find({$or: [{name: name}, {subject: name}]}, {name: 1, subject: 1}).exec(function (err, data) {
        if (!err) {
            var id_array = new Array();
            for (var i = 0; i < data.length; i++) {
                id_array.push((data[i].name).toString());
                id_array.push((data[i].subject).toString());
            }
            Array.prototype.contains = function (v) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === v) { return true; }
                }
                return false;
            };
            Array.prototype.unique = function () {
                var arr = [];
                for (var i = 0; i < this.length; i++) {
                    if (!arr.contains(this[i])) {
                        arr.push(this[i]);
                    }
                }
                return arr;
            };
            var duplicates = id_array;
            var uniques = duplicates.unique(); // result = [1,3,4,2,8]
            res.send(uniques);
        } else {
            res.send([]);
        }
    });
}); */

module.exports = router;
