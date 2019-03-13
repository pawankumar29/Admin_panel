var express = require('express');
var router = express.Router();
const controller = require("../controllers/quizController");

router.get('/', controller.get_categoriesList);
router.get('/add', controller.add_category);
router.post('/add', controller.save_new_category);
router.get('/sampeCSV', controller.csvDowload);
router.get('/importCsv/:cat_id', controller.importCsvCat);
router.get('/importCsv/:cat_id/:sub_cat_id', controller.importCsvSubCat);
router.post('/importCsv', controller.addCsv);
module.exports = router;