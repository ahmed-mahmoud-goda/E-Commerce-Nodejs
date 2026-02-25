const asyncErrorHandler = require('./../utils/asyncErrorHandler.js')
const customError = require('./../utils/customError.js')
const Cart = require('./../models/cartModel.js')

const calculateTotal = (cart) => {
  let sum = 0;

  for (let i = 0; i < cart.items.length; i++) {
    sum += cart.items[i].price * cart.items[i].quantity;
  }

  cart.totalPrice = sum;
};

const addToCart = asyncErrorHandler(async (req,res,next)=>{
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if(!product){
        return next(new customError("Product not found",404))
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if(!cart){
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const index = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );
    if(index>=0){
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].total =cart.items[itemIndex].price *cart.items[itemIndex].quantity;
    }
    else{
        cart.items.push({
            product: productId,
            quantity,
            price: product.price,
            total: product.price * quantity
        });
    }
    calculateTotal(cart)
    await cart.save();

    res.status(200).json({
        status: "success",
        cart
    });
})

const getCart = asyncErrorHandler(async (req,res,next)=>{
    const cart = await Cart.findOne({ user: req.user._id })
                            .populate("items.product");

    res.status(200).json({
        status:"success",
        cart: cart || {items:[],totalPrice:0}
    });
})
const removeFromCart = asyncErrorHandler(async (req,res,next)=>{
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if(!cart){
        return next(new customError("Cart not found", 404));
    }
    const index = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );
    if(index==-1){
        return next(new customError("Product not in cart", 404));
    }
    const product = cart.items[itemIndex];
    product.quantity -= quantity;

    if(item.quantity == 0) {
        cart.items.splice(itemIndex, 1);
    }
    calculateTotal(cart);
    await cart.save();
    res.status(200).json({
        status: "success",
        cart
    });
})

module.exports = {addToCart,getCart,removeFromCart}