var express = require('express');
var router = express.Router();
var controller = require('../controllers/cmspagesController')

// Get method for add pages
router.get('/add', controller.get_add_cms_pages);


// Get method for List and search Template
router.get('/', controller.get_cms_pages);


// Post method for add pages
router.post('/', controller.post_cms_pages);


/* router.post('/search_by', function (req, res, next) {
    var name = new RegExp('.*' + req.body.name + '.*', 'i');
    cms_page.find({$or: [{name: name}, {heading: name}], type: 1}, {name: 1, heading: 1}).exec(function (err, data) {
        if (!err) {
            var id_array = new Array();
            for (var i = 0; i < data.length; i++) {
                id_array.push((data[i].name).toString());
                id_array.push((data[i].heading).toString());
            }
            Array.prototype.contains = function (v) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === v) {
                        return true;
                    }
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

// Get method for update pages
router.post('/:id', controller.post_edit_cms_pages);



// Get method for update pages
router.get('/edit/:id',controller.get_edit_cms_pages);
 

// Get method for delete page
router.get('/delete/:id', controller.delete_cms_pages);


module.exports = router;
