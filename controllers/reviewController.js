const asyncErrorHandler = require('./../utils/asyncErrorHandler.js')
const customError = require('./../utils/customError.js')
const Review = require('./../models/reviewModel.js')
const Product = require('./../models/productModel.js')
const mongoose = require('mongoose')

const updateProduct = async (productId)=>{
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        average: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ])
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats[0]?.average || 0,
    ratingsCount: stats[0]?.count || 0
  })  
}

const addReview = asyncErrorHandler(async (req, res, next) => {
  const review = await Review.create({
    rating: req.body.rating,
    comment: req.body.comment,
    user: req.user.id,
    product: req.params.id
  })

  await updateProduct(req.params.id);

  res.status(201).json({
    status: "success",
    data:{
      review 
    }
  })
})

const deleteReview = asyncErrorHandler(async (req,res,next)=>{
    const review = await Review.findById(req.params.id);
    if(!review){
        return next(new customError("Review not found",404))
    }
    if(!review.user.equals(req.user.id) && req.user.role !="manager"){
      return next(new customError("You are not authorized to do this",403))
    }
    await review.deleteOne();

    await updateProduct(review.product);

    res.status(204).send();
})

const getProductReviews = asyncErrorHandler(async(req,res,next)=>{

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ product: req.params.productId }).populate("user", "name").sort("-createdAt").skip(skip).limit(limit);
  
  const totalReviews = await Review.countDocuments({ product: req.params.productId });

  res.status(200).json({
    status: "success",
    count: reviews.length,
    page,
    totalPages: Math.ceil(totalReviews / limit),
    data:{ 
      reviews 
    }
  });
})

const editReview = asyncErrorHandler(async (req,res,next)=>{
  const review = await Review.findById(req.params.id);
    if(!review){
        return next(new customError("Review not found",404))
    }

    if(!review.user.equals(req.user.id)){
      return next(new customError("You are not authorized to do this",403))
    }

  review.rating = req.body.rating ?? review.rating;
  review.comment = req.body.comment ?? review.comment;

  await review.save()

  await updateProduct(review.product);

  res.status(200).json({
    status: "success",
    data:{ 
      review 
    }
  });

})
module.exports = {addReview, deleteReview, getProductReviews, editReview}