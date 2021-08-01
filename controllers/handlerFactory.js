const catchAsync = require("./../utilites/catchAsync");
const AppError = require("./../utilites/appError");
const APIFeatures = require("./../utilites/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No doc Found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No doc Found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query.populate(populateOptions);

    // const doc = await query/explain();
    const doc = await query;
    // const doc = await Model.findById(req.params.id).populate("reviews");
    if (!doc) {
      return next(new AppError("No doc Found with that ID", 404));
    }

    //const tour = await Tour.findOne({ _id: req.params.id });
    // const tour = await Tour.findOne({ price: { $lte: 500 }, rating: { $gte: 4.7 } });
    // const tour = await Tour.find({ $or: [{ price: { $gte: 500 } }, { rating: { $gte: 4.7 } }] });
    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //execute query

    //to allows nested reviews on tours
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().pagination();

    // const tours = await query;
    const doc = await features.query;
    res.status(200).json({
      status: "success",
      result: doc.length,
      data: {
        doc,
      },
    });
  });
