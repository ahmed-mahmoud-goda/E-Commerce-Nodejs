const express = require("express")
const authController = require("./../controllers/authController.js")
const categoryController = require("./../controllers/categoryController.js")
const router = express.Router();

router.route('/')
    .get(categoryController.getCategories)
    .post(authController.protect,authController.restrict('admin'),categoryController.addCategory)
    
router.route('/:id')
    .delete(authController.protect,authController.restrict('admin'),categoryController.deleteCategory)


module.exports = router;