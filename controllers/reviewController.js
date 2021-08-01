const Review = require("./../models/reviewModel");
const catchAsync = require("./../utilites/catchAsync");
const handlerFactory = require("./handlerFactory");

//get al reviews
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: "success",
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// create new review

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};
// exports.createReview = catchAsync(async (req, res, next) => {
//   const newReview = await Review.create(
//     // review: req.body.review,
//     // rating: req.body.rating,
//     // tour: req.params.tourId,
//     // user: req.user.id,
//     req.body
//   );

//   res.status(201).json({
//     status: "success",
//     data: {
//       review: newReview,
//     },
//   });
// });

exports.getAllReviews = handlerFactory.getAll(Review);
exports.getReview = handlerFactory.getOne(Review, { path: "reviews" });
exports.createReview = handlerFactory.createOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
