const express = require("express")
const authController = require("./../controllers/authController.js")
const orderController= require("./../controllers/orderController.js")
const router = express.Router();

router.route('/')
    .get(authController.protect,orderController.getUserOrders)
    .post(authController.protect,authController.restrict('user'),orderController.createOrder)
    
router.route('/all-orders')
    .get(authController.protect,authController.restrict('admin'),orderController.getAllOrders)

router.route('/:id')
    .get(authController.protect,orderController.getOrderById)
    .patch(authController.protect,authController.restrict('admin'),orderController.updateOrderStatus)

module.exports = router
