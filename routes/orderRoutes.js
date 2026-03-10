const express = require("express")
const authController = require("./../controllers/authController.js")
const orderController= require("./../controllers/orderController.js")
const router = express.Router();

router.route('/')
    .get(authController.protect,orderController.getAllOrders)
    .post(authController.protect,authController.restrict('customer'),orderController.createOrder)
    
router.route('/:id')
    .get(authController.protect,orderController.getOrderById)
    
router.route('/:id/assign')
    .patch(authController.protect,authController.restrict('dispatcher'),orderController.assignDeliverer)

router.route('/:id/deliver')
    .patch(authController.protect,authController.restrict('deliverer'),orderController.completeDelivery)

router.route('/:id/cancel')
    .patch(authController.protect,authController.restrict('customer','manager'),orderController.cancelOrder)

module.exports = router
