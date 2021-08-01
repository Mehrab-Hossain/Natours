const fs = require("fs");
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utilites/appError");
const tourRouter = require("./routes/tourRoutes"); ///nijeder module er jonno full address dite hoy
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const Review = require("./models/reviewModel");

///Start Express App
const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//////////////////(1) MIDDLE WARES
app.use(express.static(path.join(__dirname, "public"))); //means al the static assest comes from public folder

//own midleware

// SET Security HTTP headers
app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false }));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// LIMIT REQUESTs for same api
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many request for this ip. Please try 1hr Later",
});

app.use("/api", limiter);

/// Body Parse , reading data from body into req.body
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/// Data senitaization against NoSQL query injection
app.use(mongoSanitize());

/// Data Senitization against Xross Site Scrypting Attack
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: ["duration", "ratingsAverage", "ratingsQuantity", "maxGroupSize", "difficulty", "price"],
  })
);

app.use(compression());

// Serving static file
// app.use(express.static(`${__dirname}/public`));

//Testing midleware
app.use((req, res, next) => {
  // console.log("hello from middle ware");
  next();
});

//
app.use((req, res, next) => {
  req.timeNOW = new Date().toISOString();
  //console.log(req.cookies);
  // console.log(req.headers);

  next();
});

//////////////////(2)ROUTE handlers

const port = 3000;

// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getTour);
//create data and update the api
// app.post("/api/v1/tours", createNewTour);
//update
// app.patch("/api/v1/tours/:id", updateData);
//for delte
// app.delete("/api/v1/tours/:id",deleteData);

/////////////////////routs

// const tourRouter = express.Router();
// const userRouter = express.Router();

// tourRouter.route("/").get(getAllTours).post(createNewTour);
// tourRouter.route("/:id").get(getTour).patch(updateData).delete(deleteData);
// userRouter.route("/").get(getAllUsers).post(createUser);
// userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

app.use("/", viewRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/reviews", reviewRouter);
//for unhandaled routes

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); //directly goes to error handling middle ware
});

//internal server error handling middleware

// app.use((err, req, res, next) => {
//   console.log(err.stack);
//   err.statusCode = err.statuscode || 500; //500 internal error
//   err.status = err.status || "error";

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

app.use(globalErrorHandler);
module.exports = app;
