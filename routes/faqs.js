var express = require('express');
var router = express.Router();
var controller = require('../controllers/faqController');


//get faqs listing
router.get('/',controller.get_faqs);

//get edit faqs
router.get('/edit/:id',controller.get_edit_faq);

//post edit faqs
router.post('/edit/:id', controller.post_edit_faq);


router.get('/add', controller.get_add_faq);

router.post('/add', controller.post_add_faq);

// Get method for delete faqs
router.get('/delete/:id',controller.delete_faq );


// Post method for update user status
router.post('/changeStatus',controller.post_change_status);
 

module.exports = router;
