const asyncErrorHandler = require("./../utils/asyncErrorHandler.js");
const customError = require("./../utils/customError.js");
const Order = require("./../models/orderModel.js")

const createOrder = asyncErrorHandler(async (req,res,next)=>{
    const { paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if(!cart||cart.items.length ==0){
        return next(new customError("Cart is empty",400));
    }

    const order = await Order.create({
        user: req.user.id,
        items: cart.items,
        totalAmount: cart.totalAmount,
        paymentMethod,
    });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
        status:"success",
        order
    });
})

const getUserOrders = asyncErrorHandler(async (req,res,next)=>{
    const orders = await Order.find({user:req.user.id}).select("totalAmount status createdAt").sort({createdAt:-1});
    res.status(200).json({
        status:"success",
        count:orders.length,
        orders
    })
})
const getAllOrders = asyncErrorHandler(async (req,res,next)=>{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = {};
    if(req.query.status){
        filter.status = req.query.status;
    }
    if(req.query.user){
        filter.user = req.query.user;
    }

    const orders = await Order.find(filter).sort({createdAt:-1}).skip(skip).limit(limit).populate("user", "name email")
    
    const totalOrders = await Order.countDocuments(filter);
    res.status(200).json({
        status:"success",
        count:totalOrders,
        page,
        totalPages: Math.ceil(totalOrders / limit),
        data:{
            orders
        }
    })
})
const getOrderById = asyncErrorHandler(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(req.user.role !== "admin" && order.user.toString() !== req.user.id){
        return next(new customError("Not authorized to view this order",403));
    }
    res.status(200).json({
        status:"success",
        order
    })
})
const updateOrderStatus = asyncErrorHandler(async (req,res,next)=>{
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {status},
        {new:true}
    )
    if(!order){
        return next(new customError("Order not found",404));
    }
    res.status(200).json({
        status:"success",
        order,
    });
})

module.exports = {createOrder, getUserOrders,getAllOrders, getOrderById, updateOrderStatus}