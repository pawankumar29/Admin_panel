var express = require('express');
var router = express.Router();
const controller = require("../controllers/instructionsController");

/* GET method for list and search Users  */
router.get('/:id', controller.get_instructions);


//router.put('/edit/:id', controller.post_edit_institution);


//// disable user
//router.post('/disable_user', controller.post_disable_user);
//
//// Get method for delete users
//router.get('/delete/:id',controller.delete_user );

//predictive search
// router.post('/search_by',controller.predictive_search);

module.exports = router;