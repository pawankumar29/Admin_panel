var express = require('express');
var router = express.Router();

var controller = require("../controllers/contactusController");



/* GET method for list and search Users  */
router.get('/', controller.get_query_list);
// Get method for view user query
router.get('/view/:id',controller.get_query_details);

// get method for delete contact requests
router.get('/delete/:id',controller.delete_query);

// get method for update contact requests
router.get('/update/:id',controller.update_query_resolved);



module.exports = router;
