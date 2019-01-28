var express = require('express');
var router = express.Router();

const controller = require('../controllers/categoriesController');


/* GET method for dashboard */
router.get('/:id', controller.get_categories);

router.post('/', controller.get_category_data);


module.exports = router;