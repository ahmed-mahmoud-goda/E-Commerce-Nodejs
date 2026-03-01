const express = require("express")
const authController = require("./../controllers/authController.js")
const orderController= require("./../controllers/orderController.js")
const router = express.Router();

router.route('/')
    .get(authController.protect,orderController.getAllOrders)
    .post(authController.protect,authController.restrict('customer'),orderController.createOrder)
    
router.route('/:id')
    .get(authController.protect,orderController.getOrderById)
    
router.route('/deliver/:id')
    .patch(authController.protect,authController.restrict('deliverer'),orderController.completeDelivery)

router.route('/cancel/:id')
    .patch(authController.protect,authController.restrict('customer','manager'),orderController.cancelOrder)

module.exports = router
