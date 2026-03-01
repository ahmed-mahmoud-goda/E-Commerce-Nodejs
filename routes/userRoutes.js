const express = require("express");
const authController = require("./../controllers/authController.js")
const userController = require("./../controllers/userController.js");

const router = express.Router();

router.route('/info')
    .get(authController.protect,userController.getUserInfo)
    .patch(authController.protect,userController.editUserInfo)
    .delete(authController.protect,userController.deleteAccount)

router.route('/deliverers')
    .get(authController.protect, authController.restrict('dispatcher'), userController.getDeliverers);

router.route('/employees')
    .get(authController.protect,authController.restrict('manager'),userController.getAllEmployees)

router.route('/ban/:id')
    .patch(authController.protect,authController.restrict('manager'),userController.banAccount)

router.route('/unban/:id')
    .patch(authController.protect,authController.restrict('manager'),userController.unbanAccount)

module.exports = router;