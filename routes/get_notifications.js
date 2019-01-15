var express = require('express');
var router = express.Router();

var controller = require('../controllers/notificationController');

router.get('/', controller.get_notification_list);
router.get('/update/:id',controller.update_notification_status);
router.get('/all_mark_as_read',controller.update_all_to_read);


module.exports = router;
