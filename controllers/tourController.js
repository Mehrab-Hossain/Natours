const fs = require("fs");
const Tour = require("./../models/tourModel");
const multer = require("multer");
const sharp = require("sharp");
const express = require("express");
const APIFeatures = require("./../utilites/apiFeatures");
const handlerFactory = require("./handlerFactory");

//errormodule
const catchAsync = require("./../utilites/catchAsync");
const AppError = require("../utilites/appError");
//mvc way

//alis (/top-5-cheap)
exports.alias = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

//uploading images
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image!,Please upload only image", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// upload.single("photo"); req.file
// upload.array("images",5); req.files
exports.uploadTourImages = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  //console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  ///1 cover images
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}`;
  await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/tours/${imageCoverFileName}`);
  req.body.imageCover = imageCoverFileName;

  //images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}`;
      await sharp(file.buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});
exports.getAllTours = handlerFactory.getAll(Tour);

exports.getToursWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  //console.log(latlng);
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  if (!lat || !lng) {
    return next(new AppError("Please provide in the format lat,lang", 400));
  }

  // console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  //console.log(latlng);
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    return next(new AppError("Please provide in the format lat,lang", 400));
  }

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  //console.log(distance, lat, lng, unit);

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    //result: tours.length,
    data: {
      //tours,
      distances,
    },
  });
});
//read dataalll -get
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //execute query
//   const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().pagination();

//   // const tours = await query;
//   const tours = await features.query;
//   res.status(200).json({
//     status: "success",
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });

// res.status(200).json({
//   status: "success",
//   result: tours.length,
//   data: {
//     ///tours,
//   },
// });

// try {
//   //const tours = await Tour.find();
//   // console.log(req.query);
//   //const tours = await Tour.find(req.query);

//   ///1.simple filtering
//   // const queryObj = { ...req.query };
//   // const excludeQuries = ["page", "limit", "sort", "fields"];
//   // excludeQuries.forEach((el) => delete queryObj[el]);

//   // ///2.advance filtering

//   // console.log(queryObj);

//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//   // let query = Tour.find(JSON.parse(queryStr));
//   // console.log(JSON.parse(queryStr));

//   // ///3..sorting
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(",").join(" "); ///sort("price -cretaedAt")
//   //   query = query.sort(sortBy);
//   // } else {
//   //   query = query.sort("-createdAt");
//   // }

//   ////4.limiting fields(which porperty users wants to see)

//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(",").join(" ");
//   //   query = query.select(fields);
//   // } else query = query.select("-__v");

//   // ////5.pagination
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 10;
//   // const contentSkip = (page - 1) * limit;

//   // query = query.skip(contentSkip).limit(limit);

//   // if (req.query.page) {
//   //   const content = await Tour.countDocuments();

//   //   if (skip >= content) throw new Error("page not exits");
//   // }

//   // //execute query
//   // const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().pagination();

//   // const tours = await query;
//   const tours = await features.query;
//   res.status(200).json({
//     status: "success",
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// } catch (error) {
//   res.status(404).json({
//     status: "fail",
//     data: {
//       error,
//     },
//   });
// }
// });

// //get only one tour-get
// //read data and routing with varaiables
// //:id means create a variable name id and we get it from req.params.id
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate("reviews");
//   if (!tour) {
//     return next(new AppError("No Tour Found with that ID", 404));
//   }

//   //const tour = await Tour.findOne({ _id: req.params.id });
//   // const tour = await Tour.findOne({ price: { $lte: 500 }, rating: { $gte: 4.7 } });
//   // const tour = await Tour.find({ $or: [{ price: { $gte: 500 } }, { rating: { $gte: 4.7 } }] });
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });

exports.getTour = handlerFactory.getOne(Tour, { path: "reviews" });

//console.log(req.params.id); //string type id

// const id = req.params.id * 1;
// //const tour = tours.find((el) => el.id === id);
// res.status(200).json({
//   status: "success",
//   data: {
//     // tour,
//   },
// });
// // res.end("done");

// try {
//   const tour = await Tour.findById(req.params.id);

//   //const tour = await Tour.findOne({ _id: req.params.id });
//   // const tour = await Tour.findOne({ price: { $lte: 500 }, rating: { $gte: 4.7 } });
//   // const tour = await Tour.find({ $or: [{ price: { $gte: 500 } }, { rating: { $gte: 4.7 } }] });
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// } catch (error) {
//   res.status(404).json({
//     status: "fail",
//     data: {
//       error,
//     },
//   });
// }
// });

exports.createNewTour = handlerFactory.createOne(Tour);

// ///create new tour-post
// exports.createNewTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(200).json({
//     status: "success",
//     data: {
//       newTour,
//     },
//   });
// console.log(req.body);
// const newID = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newID }, req.body);
// tours.push(newTour);

// fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
//   if (err) console.log("error in data");
//   res.status(201).json({
//     status: "success",
//     data: {
//       // tour: newTour,
//     },
//   });
// });
// res.send("done");\

//old way
// const newTour = new Tour(req.body);
// newTour.save();

//modern way with

// try {
// } catch (error) {
//   res.status(400).json({
//     status: "fail",
//     data: {
//       error,
//     },
//   });
// }
// });

///update one data - patch

exports.updateTour = handlerFactory.updateOne(Tour);
// exports.updateData = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError("No Tour Found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });

// //console.log(req.params.id); //string type id
// const id = req.params.id * 1;
// //const tour = tours.find((el) => el.id === id);
// res.status(200).json({
//   status: "success",
//   data: {
//     // tour,
//   },
// });
// // res.end("done");

// try {
//   ///go to mongoose and check all the function
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// } catch (error) {
//   res.status(400).json({
//     status: "fail",
//     data: {
//       error,
//     },
//   });
// }
// });

///delete one data -delete
exports.deleteTour = handlerFactory.deleteOne(Tour);
// exports.deleteData = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError("No Tour Found with that ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//   });

// //console.log(req.params.id); //string type id

// const id = req.params.id * 1;
// // const tour = tours.find((el) => el.id === id);
// res.status(204).json({
//   status: "success",
//   data: {
//     tour: null,
//   },
// });
// // res.end("done");

// try {
//   await Tour.findByIdAndDelete(req.params.id);

//   res.status(200).json({
//     status: "success",
//   });
// } catch (error) {
//   res.status(400).json({
//     status: "fail",
//     data: {
//       error,
//     },
//   });
// }
// });

///aggregation pipeline
exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: {
          $toUpper: "$difficulty",
        },
        // _id: "$ratingsAverage",
        numRatings: { $sum: "$ratingsQuantity" },
        numTours: { $sum: 1 },
        avrgRating: { $avg: "$ratingsAverage" },
        avrgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avrgPrice: 1 },
    },
    // {
    //   $match: {
    //     _id: { $ne: "EASY" },
    //   },
    // },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
  // try {
  //   const stats = await Tour.aggregate([
  //     {
  //       $match: { ratingsAverage: { $gte: 4.5 } },
  //     },

  //     {
  //       $group: {
  //         _id: {
  //           $toUpper: "$difficulty",
  //         },
  //         // _id: "$ratingsAverage",
  //         numRatings: { $sum: "$ratingsQuantity" },
  //         numTours: { $sum: 1 },
  //         avrgRating: { $avg: "$ratingsAverage" },
  //         avrgPrice: { $avg: "$price" },
  //         minPrice: { $min: "$price" },
  //         maxPrice: { $max: "$price" },
  //       },
  //     },
  //     {
  //       $sort: { avrgPrice: 1 },
  //     },
  //     // {
  //     //   $match: {
  //     //     _id: { $ne: "EASY" },
  //     //   },
  //     // },
  //   ]);
  //   res.status(200).json({
  //     status: "success",
  //     data: {
  //       stats,
  //     },
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: "fail",
  //     data: {
  //       error,
  //     },
  //   });
  // }
});

///get monthly plan
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plans = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        numTours: { $sum: 1 },
        tourNames: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      plans,
    },
  });

  // try {
  //   const year = req.params.year * 1;
  //   const plans = await Tour.aggregate([
  //     {
  //       $unwind: "$startDates",
  //     },
  //     {
  //       $match: {
  //         startDates: {
  //           $gte: new Date(`${year}-01-01`),
  //           $lte: new Date(`${year}-12-31`),
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: {
  //           $month: "$startDates",
  //         },
  //         numTours: { $sum: 1 },
  //         tourNames: { $push: "$name" },
  //       },
  //     },
  //     {
  //       $addFields: {
  //         month: "$_id",
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 0,
  //       },
  //     },
  //     {
  //       $sort: {
  //         numTours: -1,
  //       },
  //     },
  //   ]);
  //   res.status(200).json({
  //     status: "success",
  //     data: {
  //       plans,
  //     },
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: "fail",
  //     data: {
  //       error,
  //     },
  //   });
  // }
});
/////api way.....
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkId = (req, res, next, val) => {
//   if (req.params.id * 1 >= tours.length) {
//     console.log(`tour id is ${val}`);
//     return res.status(404).json({
//       status: "fail",
//       message: "invalid id",
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: "fail",
//       message: "name or price missing",
//     });
//   }
//   next();
// };
// //read data
// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     status: "success",
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// };
// //get only one tour
// //read data and routing with varaiables
// //:id means create a variable name id and we get it from req.params.id
// exports.getTour = (req, res) => {
//   //console.log(req.params.id); //string type id

//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
//   // res.end("done");
// };

// ///create new tour
// exports.createNewTour = (req, res) => {
//   console.log(req.body);
//   const newID = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newID }, req.body);
//   tours.push(newTour);

//   fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
//     if (err) console.log("error in data");
//     res.status(201).json({
//       status: "success",
//       data: {
//         tour: newTour,
//       },
//     });
//   });
//   // res.send("done");
// };

// exports.updateData = (req, res) => {
//   //console.log(req.params.id); //string type id

//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
//   // res.end("done");
// };

// exports.deleteData = (req, res) => {
//   //console.log(req.params.id); //string type id

//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);
//   res.status(204).json({
//     status: "success",
//     data: {
//       tour: null,
//     },
//   });
//   // res.end("done");
// };
