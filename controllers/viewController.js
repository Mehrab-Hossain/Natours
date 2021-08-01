const AppError = require("../utilites/appError");
const Tour = require("./../models/tourModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utilites/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  //get tour data from collection
  const tours = await Tour.find();
  //2 build template

  //3...Render that template
  res.status(200).render("overview", {
    title: "ALL Tours",
    tours,
  });
});
// exports.getOverview =catchAsync(aync(req,res,next) => {

// });

exports.getTour = catchAsync(async (req, res, next) => {
  const filter = {
    slug: req.params.slug,
  };
  const tour = await Tour.findOne(filter).populate({
    path: "reviews",
    fields: "review rating user",
  });
  if (!tour) {
    return next(new AppError("There is no tour with this name", 404));
  }
  //console.log(tour);
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getloginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log Into Your Account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: req.user.name,
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  //console.log(req.body);

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render("account", {
    title: req.user.name,
    user: updatedUser,
  });
});
