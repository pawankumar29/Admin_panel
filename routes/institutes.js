var express = require('express');
var router = express.Router();
const controller = require("../controllers/instituteController");

/* GET method for list and search Users  */
router.get('/', controller.get_institutions);

// get add institute page-
router.get('/add', controller.add_institutions);

// get institution
router.post('/add', controller.add_new_institutions);

// get edit page
router.get('/edit/:id', controller.get_edit_institution);


router.post('/edit/:id', controller.post_edit_institution);


// download sample csv file
router.get('/sampeCSV', controller.csvDowload);

//// disable user
//router.post('/disable_user', controller.post_disable_user);
//
//// Get method for delete users
//router.get('/delete/:id',controller.delete_user );

//predictive search
// router.post('/search_by',controller.predictive_search);

module.exports = router;