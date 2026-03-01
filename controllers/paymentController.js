const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const customError = require("./../utils/customError");
const stripe = require("./../configs/stripe.js");
const Order = require("./../models/orderModel");
const Payment = require("./../models/paymentModel.js");

const createPayment = asyncErrorHandler(async (req,res,next)=>{
    const { orderId, paymentMethod } = req.body;
    const order = await Order.findbyId(orderId);
    if(!order){
        return next(new customError("Order not found",404))
    }
    if(order.status!="pending"){
        return next(new customError("Order already paid", 400));
    }
    const payment = await Payment.create({
        order: orderId,
        user: order.user,
        paymentMethod,
        amount: order.totalAmount
    });
    if(paymentMethod=="card"){
        const paymentIntent = await stripe.paymentIntents.create({
            amount: order.totalAmount*100,
            currency: 'egp',
            automatic_payment_methods: { enabled: true },
            metadata: { orderId: orderId },
        });
        const clientSecret = paymentIntent.client_secret;
        payment.transactionId = paymentIntent.id;
        await payment.save(); 

        res.status(201).json({
            status:"success",
            data:{
                payment,
                clientSecret
            }
        });
    }
})

const confirmPayment = asyncErrorHandler(async (req,res,next)=>{
    const { paymentIntentId } = req.body;
    const payment = await Payment.findOne({transactionId: paymentIntentId}).populate('order');
    if(!payment){
        return next(new customError("Payment not found",404));
    }
    if(payment.paymentMethod != "card"){
        return next(new customError("This is for card payment only",400));
    }
    if(payment.status =="completed"){
        return next(new customError("Payment already done",400));
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if(paymentIntent.status!="succeeded"){
        payment.status = "failed";
        await payment.save();
        return next(new customError("Payment not successful",400));
    }
    payment.status = "completed";
    payment.paidAt = new Date();
    await payment.save();

    const order = payment.order;
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();
    res.status(200).json({
        status:"success",
        data:{
            payment,
            order
        }
    });
})

const completeCashPayment = asyncErrorHandler(async (req,res,next)=>{
    const payment = await Payment.findById(req.body.paymentId).populate("order");
    if(!payment){ 
        return next(new customError("Payment not found", 404));
    }
    if(payment.paymentMethod!="cash"){
        return next(new customError("This is only for cash",400));
    }
    payment.status = "completed";
    payment.paidAt = new Date();
    await payment.save();

    const order = payment.order;
    order.status = "delivered";
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    res.status(200).json({
        status: "success",
        data:{
            payment, 
            order 
        }
    });
})

const getAllPayments = asyncErrorHandler(async (req,res,next)=>{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const filter = {};
    if(req.query.user){
        filter.user = req.query.user;
    }
    if(req.query.order){
        filter.order = req.query.order;
    }
    const payments = await Payment.find(filter).skip(skip).limit(limit).populate("user order");
    const totalPayments = await Payment.countDocuments(filter);
    res.status(200).json({
        status: "success",
        count: totalPayments,
        page,
        totalPages: Math.ceil(totalPayments / limit),
        data:{
            payments
        },
    });
})

const getUserPayments = asyncErrorHandler(async (req,res,next)=>{
    const payments = await Payment.find({ user: req.user.id }).populate("order");
    res.status(200).json({
        status: "success",
        count: payments.length,
        data:{
            payments
        },
    });
})

module.exports = {createPayment, confirmPayment, completeCashPayment, getAllPayments, getUserPayments}