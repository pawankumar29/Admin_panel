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

router.post('/add_batch', controller.add_batch);

router.post('/edit/:id', controller.post_edit_institution);


// download sample csv file
router.get('/sampeCSV', controller.csvDowload);

//// disable user
//router.post('/disable_user', controller.post_disable_user);
//
// Get method for delete institution
router.get('/delete/:id', controller.delete_institute);


router.post('/enable_test', controller.enable_test);


//predictive search

// router.post('/search_by',controller.predictive_search);




//get Walkings Details
router.get('/get-walkins', controller.addWalkins);
//aading new walkings
router.get('/add-new-walkins', controller.addNewWalkies);
//post add walkins
router.post('/post-add-walkins',controller.postAddWalkins);
//get edit walkings
router.get('/get-edit-walkings/:id',controller.get_edit_walkings)
//post edit walkings
router.post('/post-edit-walkings/:id',controller.post_edit_walkings)
//enable test for walkings
router.post('/enable-test-walkings', controller.enable_test_walkings);
//add new walkings
router.post('/add-new-walkings',controller.add_new_walkings)


module.exports = router;