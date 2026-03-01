const express = require("express");
const authController = require("./../controllers/authController.js");
const paymentController = require("./../controllers/paymentController.js");

const router = express.Router();

router.route('/')
    .post(authController.protect,paymentController.createPayment)

router.route('/confirm')
    .post(authController.protect,paymentController.confirmPayment)

router.route('/cash')
    .post(authController.protect,paymentController.completeCashPayment)

router.route('/')
    .get(authController.protect,authController.restrict('manager'),paymentController.getAllPayments)

router.route('/my-payments')
    .get(authController.protect,paymentController.getUserPayments)

module.exports = router;