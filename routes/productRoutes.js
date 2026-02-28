const express = require("express")
const authController = require("./../controllers/authController.js")
const productController = require("./../controllers/productController.js")
const {uploadImage} = require("./../configs/upload.js")

const router = express.Router();

router.route('/')
    .get(productController.getAllProducts)
    .post(authController.protect,authController.restrict('manager','stocker'),uploadImage.array("images",5),productController.addProduct)

router.route('/:id')
    .get(productController.getProduct)
    .patch(authController.protect,authController.restrict('manager','stocker'),productController.editProduct)
    .delete(authController.protect,authController.restrict('manager','stocker'),productController.deleteProduct)

module.exports = router