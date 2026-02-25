const express = require("express")
const authController = require("./../controllers/authController.js")
const cartController = require("./../controllers/cartController.js")

const router = express.Router();

router.route('/')
    .get(authController.protect,authController.restrict('user'),cartController.getCart)

router.route('/:id')
    .post(authController.protect,authController.restrict('user'),cartController.addToCart)
    .patch(authController.protect,authController.restrict('user'),cartController.removeFromCart)

module.exports = router;