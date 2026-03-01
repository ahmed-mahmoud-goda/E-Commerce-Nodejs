const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deliverer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "delivered","cancelled"],
    default: "pending",
  },
  deliveryDate:Date,
  paymentMethod: {
    type: String,
    enum: ["card", "cash"],
    required: true,
  },
  isPaid:{
    type: Boolean,
    default: false
  },
  paidAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
