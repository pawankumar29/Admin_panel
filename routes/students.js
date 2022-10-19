var express = require('express');
var router = express.Router();
const controller = require("../controllers/studentsController");

router.get('/:inst_id', controller.get_students);
router.post('/student_shortlist', controller.student_shortlist);
router.post('/student_offerletter', controller.send_offerletter);
router.get('/edit/:user_id', controller.get_user_detail);

module.exports = router;