var express = require('express');
var router = express.Router();
const controller = require("../controllers/result");

/* GET method for list and search Users  */
router.get('/', controller.get_quiz);

router.get('/students', controller.get_quiz_result);

// download sample csv file
// router.get('/sampeCSV', controller.csvDowload);

//// disable user
//router.post('/disable_user', controller.post_disable_user);

//predictive search
// router.post('/search_by',controller.predictive_search);

module.exports = router;