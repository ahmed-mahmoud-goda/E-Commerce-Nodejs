const express = require("express")
const authController = require("./../controllers/authController.js")
const cartController = require("./../controllers/cartController.js")

const router = express.Router();

router.route('/')
    .get(authController.protect,authController.restrict('customer'),cartController.getCart)

router.route('/:productId')
    .patch(authController.protect,authController.restrict('customer'),cartController.updateCartItems)

module.exports = router;