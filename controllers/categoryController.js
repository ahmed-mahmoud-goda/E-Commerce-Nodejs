const asyncErrorHandler = require('./../utils/asyncErrorHandler.js')
const customError = require('./../utils/customError.js')
const Category = require('./../models/categoryModel.js')

const addCategory = asyncErrorHandler(async (req,res,next)=>{
    const {name,description} = req.body;
    if (!name) {
        return next(new customError("Category name is required", 400));
    }
    const isExist = await Category.findOne({name});
    if(isExist){
        return next(new customError("Category already exists",400));
    }
    let slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    const category = await Category.create({name,description,slug});
    res.status(201).json({
        status:"success",
        data:{
            category
        }
    })
})

const deleteCategory = asyncErrorHandler(async (req,res,next)=>{
    const id = req.params.id;
    const category = await Category.findByIdAndDelete(id);
    if(!category){
        return next(new customError("Category not found",404))
    }
    res.status(204).send();
})

const getCategories = asyncErrorHandler(async (req,res,next)=>{
    const categories = await Category.find().select({name:1,slug:1})
    res.status(200).json({
        status:"success",
        data:{
            categories
        }
    })
})

module.exports = {addCategory, deleteCategory, getCategories};