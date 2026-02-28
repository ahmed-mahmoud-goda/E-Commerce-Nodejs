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
        data:{
            order
        }
    });
})
const getAllOrders = asyncErrorHandler(async (req,res,next)=>{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = {};
    if(req.query.status){
        filter.status = req.query.status;
    }
    if(["manager","dispatcher"].includes(req.user.role)){
        if(req.query.user){
            filter.user = req.query.user;
        }
        if(req.query.assigned == "false"){
            filter.deliverer = null;
        }
        if(req.query.assigned == "true"){
            filter.deliverer = { $ne: null };
        }
    }
    if(req.user.role == "customer"){
        filter.user = req.user._id;
    }
    else if(req.user.role == "deliverer"){
        filter.deliverer = req.user._id;
    }

    let query = Order.find(filter).sort({createdAt:-1}).skip(skip).limit(limit).populate("user", "name email");
    
    if(req.user.role != "customer"){
        query.populate("deliverer", "name email");
    }

    const orders = await query;
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
    let query = Order.findById(req.params.id);
    if(req.user.role == "customer"){
        query = query.select("-deliverer");
    }
    else{
        query = query.populate("deliverer", "name email");
    }
    const order = await query;
    if(!order){
        return next(new customError("Order not found",404));
    }
    if(req.user.role == "customer" && order.user.toString()!= req.user.id){
            return next(new customError("Not authorized to view this order",403));
    }
    res.status(200).json({
        status:"success",
        data:{
            order
        }
    })
})
const updateOrderStatus = asyncErrorHandler(async (req,res,next)=>{
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id,{status},{new:true})
    if(!order){
        return next(new customError("Order not found",404));
    }
    res.status(200).json({
        status:"success",
        data:{
            order
        }
    });
})
const assignDeliverer = asyncErrorHandler(async (req,res,next)=>{
    const {delivererId} = req.body;
    if(!delivererId){
        return next(new customError("Deliverer ID is required",400));
    }
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new customError("Order not found", 404));
    }
    if(["delivered"].includes(order.status)){
        return next(new customError("Cannot assign this order", 404));
    }
    const deliverer = await User.findById(delivererId);
    if(!deliverer || deliverer.role !== "deliverer"){
        return next(new customError("Invalid deliverer", 400));
    }
    order.deliverer = delivererId;
    await order.save();
    res.status(200).json({
        status: "success",
        data:{
            order
        }
    });
})

module.exports = {createOrder, getAllOrders, getOrderById, updateOrderStatus, assignDeliverer}