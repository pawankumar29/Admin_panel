var express = require('express');
var router = express.Router();
const controller = require("../controllers/instructionsController");

/* GET method for list and search Users  */
router.get('/:id', controller.get_instructions);

//delete any instruction
router.delete('/', controller.delete_instruction);

//update any instruction
router.put('/', controller.edit_instruction);

router.post('/', controller.add_instruction);


//predictive search
// router.post('/search_by',controller.predictive_search);

module.exports = router;