const asyncErrorHandler = require('./../utils/asyncErrorHandler.js')
const customError = require('./../utils/customError.js')
const Product = require('./../models/productModel.js')

const addProduct = asyncErrorHandler(async (req,res,next)=>{
    const product = await Product.create(req.body);
    res.status(201).json({
        status:"success",
        data:{
            product
        }
    })
})

const getAllProducts = asyncErrorHandler(async (req,res,next)=>{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = {}
    if(req.query.category){
        filter.category = req.query.category
    }
    
    const products = await Product.find(filter).skip(skip).limit(limit)
    
    res.status(200).json({
        status:"success",
        data:{
            products
        }
    })
})

const getProduct = asyncErrorHandler(async (req,res,next)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        return next(new customError("Product not found",404))
    }
    res.status(200).json({
        status:"success",
        data:{
            product
        }
    })
})

const editProduct = asyncErrorHandler(async (req,res,next)=>{
    const product = await Product.findByIdAndUpdate(req.params.id,req.body,{ new: true, runValidators: true })
    
    if(!product){
        return next(new customError("Product not found",404))
    }

    res.status(200).json({
        status:"success",
        data:{
            product
        }
    })
})

const deleteProduct = asyncErrorHandler(async (req,res,next)=>{
    const product = await Product.findByIdAndDelete(req.params.id);
    if(!product){
        return next(new customError("Product not found",404))
    }
    res.status(204).send();
})

module.exports = {addProduct, getAllProducts, getProduct, editProduct, deleteProduct};