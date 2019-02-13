var express = require('express');
var router = express.Router();
const controller = require("../controllers/quizController");

router.get('/', controller.get_categoriesList);
router.get('/add', controller.add_category);
router.post('/add', controller.save_new_category);
module.exports = router;