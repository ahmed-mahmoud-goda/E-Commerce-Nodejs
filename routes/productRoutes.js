const express = require("express")
const authController = require("./../controllers/authController.js")
const productController = require("./../controllers/productController.js")

const router = express.Router();

router.route('/')
    .get(authController.protect,productController.getAllProducts)
    .post(authController.protect,authController.restrict('admin'),productController.addProduct)

router.route('/:id')
    .get(authController.protect,productController.getProduct)
    .patch(authController.protect,authController.restrict('admin'),productController.editProduct)
    .delete(authController.protect,authController.restrict('admin'),productController.deleteProduct)

module.exports = router