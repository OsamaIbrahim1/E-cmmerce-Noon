import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import Review from "../../../DB/models/review.model.js";

//===================================== add review ===================================//
/**
 * * destructure data from authUser and params
 * * check product
 * * review data
 * * create new document
 * * response successfully
 */
export const addReview = async (req, res, next) => {
  // * destructure data from authUser and params
  const userId = req.authUser._id;
  const productId = req.params.productId;

  // * check product
  const isProductValidToBeReview = await Order.findOne({
    user: userId,
    "orderItems.product": productId,
    orderStatus: "Delivered",
  });
  if (!isProductValidToBeReview) {
    return next("you should buy the product first", { cause: 400 });
  }

  // * check if this user is already rated product
  const rateproduct = await Review.findOne({ userId, productId });
  if (rateproduct) {
    return next("you already rated this product", { cause: 400 });
  }

  console.log(rateproduct);
  // * review data
  const { reviewRate, reviewComment } = req.body;
  const reviewObj = {
    userId,
    productId,
    reviewComment,
    reviewRate,
  };

  // * count all rate product
  const product = await Product.findById(productId);

  const reviews = await Review.find({ productId });

  let sumOfRates = 0;
  for (const review of reviews) {
    sumOfRates += review.reviewRate;
  }
  sumOfRates += reviewRate;
  product.rate = Number(sumOfRates / (reviews.length + 1)).toFixed(2);
  await product.save();

  // * create new document
  const review = await Review.create(reviewObj);
  if (!review) {
    return next("Review failed", { cause: 400 });
  }

  // * response successfully
  res
    .status(201)
    .json({ message: "Review successfully created", data: review });
};

//===================================== delete review ===================================//
/**
 * * destructure data from authUser and params
 * * find review and delete
 * * response successfully
 */
export const deleteReview = async (req, res, next) => {
  // * destructure data from authUser and params
  const userId = req.authUser._id;
  const { reviewId } = req.params;

  // * find review and delete
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });
  if (!review) {
    return next("review not found", { cause: 404 });
  }

  // * response successfully
  res.status(200).json({
    success: true,
    message: "Review successfully deleted",
    data: review,
  });
};

//===================================== Get all reviews for specific product ===================================//
/**
 * * destructure data from authUser and params
 * * get all reviews for specific product
 * * response successfully
 */
export const getAllReviewsforProduct = async (req, res, next) => {
  // * destructure data from authUser and params
  const { productId } = req.params;

  // * get all reviews for specific product
  const reviews = await Review.find({ productId });
  if (!reviews.length) {
    return next("not found reviews for this product", { cause: 404 });
  }

  // * response successfully
  res.status(200).json({
    success: true,
    message: "get all reviews for product",
    data: reviews,
  });
};


