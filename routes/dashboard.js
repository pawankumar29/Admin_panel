var express = require('express');
var router = express.Router();

const controller = require('../controllers/dashboardController');


/* GET method for dashboard */
router.get('/', controller.dashboard_get);


/* GET method to render Admin Profile */
router.get('/profile', controller.get_profile);

/* POST method for Admin Profile */
router.post('/profile', controller.post_profile);

// Post method for send otp
router.post('/send_otp', controller.send_otp_post);

//
// Get method for resend otp
router.get('/resend_otp', controller.resend_otp_get);

// Get request for ChangePassword
router.get('/changePassword', controller.change_password_get);

// Post request for ChangePassword
router.post('/changePassword', controller.change_password_post);

// Get request for settings
router.get('/settings/changeTheme', controller.setting_theme);

///* POST method for Settings */
//router.post('/settings',controller.setting_post);

module.exports = router;
