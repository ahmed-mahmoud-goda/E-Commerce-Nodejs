const asyncErrorHandler = require('./../utils/asyncErrorHandler.js')
const customError = require('./../utils/customError.js')
const Product = require('./../models/productModel.js')
const fs = require('fs')
const path = require('path')

const addProduct = asyncErrorHandler(async (req,res,next)=>{
    const imagePaths = req.files.map(
      file => file.path.replace(/\\/g, "/")
    );
    const product = await Product.create({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        images:imagePaths
    });
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
    
    const products = await Product.find(filter).select('name price images ratingAverage ratingsCount').skip(skip).limit(limit)

    const totalProducts = await Product.countDocuments(filter);
    res.status(200).json({
        status:"success",
        page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
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
    const product = await Product.findById(req.params.id); 
    if(!product){
        return next(new customError("Product not found",404))
    }

    let newImages = [];
    if(req.files){
            newImages = req.files.map(
            file => file.path.replace(/\\/g, "/")
        );
    }

    const updatedImages = [...req.body.existingImages, ...newImages];

    if (updatedImages.length > 5) {
      return next(new customError("Maximum 5 images allowed",400))
    }
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.images = updatedImages;

    await product.save();
    res.status(200).json({
        status:"success",
        data:{
            product
        }
    })
})

const deleteProduct = asyncErrorHandler(async (req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new customError("Product not found",404))
    }
    product.images.forEach(img => {
      const fullPath = path.join(process.cwd(), img);
      fs.unlink(fullPath, err => {
        if (err) console.log("Failed to delete:", err);
      });
    });
    await product.deleteOne();
    res.status(204).send();
})

module.exports = {addProduct, getAllProducts, getProduct, editProduct, deleteProduct};