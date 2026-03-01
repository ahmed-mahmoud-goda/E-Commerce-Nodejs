const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    paymentMethod:{
        type:String,
        enum:["stripe","cash"],
        required:true
    },
    transactionId:String,
    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
    },
    paidAt: Date,
    refundedAt: Date
})

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;