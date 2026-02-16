const asyncErrorHandler = require('./../utils/asyncErrorHandler.js')
const customError = require('./../utils/customError.js')
const Review = require('./../models/reviewModel.js')

const addReview = asyncErrorHandler(async (req, res, next) => {
  const review = await Review.create({
    rating: req.body.rating,
    comment: req.body.comment,
    user: req.user.id,
    product: req.body.product
  })

  res.status(201).json({
    status: "success",
    data: { review }
  })
})

module.exports = {addReview}