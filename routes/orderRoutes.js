const express = require("express")
const authController = require("./../controllers/authController.js")
const orderController= require("./../controllers/orderController.js")
const router = express.Router();

router.route('/')
    .get(authController.protect,orderController.getAllOrders)
    .post(authController.protect,authController.restrict('customer'),orderController.createOrder)
    
router.route('/:id')
    .get(authController.protect,orderController.getOrderById)
    .patch(authController.protect,authController.restrict('manager','deliverer'),orderController.updateOrderStatus)

module.exports = router
