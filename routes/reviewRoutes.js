const express = require("express")
const authController = require("./../controllers/authController.js")
const reviewController = require("./../controllers/reviewController.js")

const router = express.Router();

router.route('/product/:id')
    .get(authController.protect,reviewController.getProductReviews)
    .post(authController.protect,authController.restrict("customer"),reviewController.addReview)

router.route('/:id')
    .patch(authController.protect,authController.restrict("customer"),reviewController.editReview)
    .delete(authController.protect,reviewController.deleteReview)

module.exports = router