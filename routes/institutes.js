var express = require('express');
var router = express.Router();
const controller = require("../controllers/instituteController");



/* GET method for list and search Users  */
router.get('/', controller.get_institutions);

// get user details
//router.get('/user_detail/:id', controller.get_user_detail);
//
//// disable user
//router.post('/disable_user', controller.post_disable_user);
//
//// Get method for delete users
//router.get('/delete/:id',controller.delete_user );

//predictive search
// router.post('/search_by',controller.predictive_search);


module.exports = router;
