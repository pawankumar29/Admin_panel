var express = require('express');
var router = express.Router();

const controller = require('../controllers/categoriesController');

router.get("/list", controller.get_category_list);

router.get('/:id', controller.get_categories);

router.post('/', controller.get_category_data);

router.put('/', controller.update_category_data);

//adding question categories for walking users
router.get("/walkings/list",controller.get_category_walkings_list)
router.get("/walkings/list/:id",controller.get_categories_walking)
router.post("/walkings/",controller.get_walking_category_data)
router.put("/walkings-category/update",controller.update_walking_category_data)



module.exports = router;