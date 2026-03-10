const asyncErrorHandler = require('./../utils/asyncErrorHandler.js')
const customError = require('./../utils/customError.js')
const Cart = require('./../models/cartModel.js')
const Product = require('./../models/productModel.js')

const calculateTotal = (cart) => {
  let sum = 0;

  for (let i = 0; i < cart.items.length; i++) {
    sum += cart.items[i].price * cart.items[i].quantity;
  }

  cart.totalPrice = sum;
};

const updateCartItems = asyncErrorHandler(async (req,res,next)=>{
    const productId = req.params.productId;
    const {quantity} = req.body;

    const product = await Product.findById(productId);
    if(!product){
        return next(new customError("Product not found",404))
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if(!cart){
        if(quantity<=0){
            return next(new customError("Cannot remove from empty cart",400))
        }
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const index = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );
    if(index>=0){
        cart.items[index].quantity += quantity;
        if(cart.items[index].quantity<=0){
            cart.items.splice(index,1)
        }
        else{
            cart.items[index].total =cart.items[index].price *cart.items[index].quantity;
        }
    }
    else{
        if(quantity<=0){
            return next(new customError("Can't remove from item as it does not exist"));
        }
        cart.items.push({
            product: productId,
            quantity,
            price: product.price
        });
    }
    calculateTotal(cart)
    await cart.save();

    res.status(200).json({
        status: "success",
        data:{
            cart
        }
    });
})

const getCart = asyncErrorHandler(async (req,res,next)=>{
    const cart = await Cart.findOne({ user: req.user._id })
                            .populate("items.product");

    res.status(200).json({
        status:"success",
        data:{
            cart: cart || {items:[],totalPrice:0}
        }
    });
})

module.exports = {updateCartItems,getCart}