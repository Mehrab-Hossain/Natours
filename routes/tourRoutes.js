const express = require("express");
const tourController = require("./../controllers/tourController");
const AuthController = require("./../controllers/authController");
const reviewController = require("./../controllers/reviewController");
const reviewRouter = require("./../routes/reviewRoutes");

const router = express.Router();

///mvc wa
router.route("/statistics").get(tourController.getStats);
router.route("/tours-monthly-plan/:year").get(AuthController.protect, AuthController.restrictTo("admin", "lead-guide", "guide"), tourController.getMonthlyPlan);
router.route("/top-5-cheap").get(tourController.alias, tourController.getAllTours);

router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(tourController.getToursWithIn);
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router.route("/").get(tourController.getAllTours).post(AuthController.protect, AuthController.restrictTo("admin", "lead-guide"), tourController.createNewTour);
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(AuthController.protect, AuthController.restrictTo("admin", "lead-guide"), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)
  .delete(AuthController.protect, AuthController.restrictTo("admin", "lead-guide"), tourController.deleteTour);

router.use("/:tourId/reviews", reviewRouter);

//post tour/4324234df/review
// get tour/w42342wf/review
// get tour/34r234e/ reviewew/34err43

// router.route("/:tourId/reviews").post(AuthController.protect, AuthController.restrictTo("user"), reviewController.createReview);

///api way
// router.param("id", tourController.checkId);

// router.route("/").get(tourController.getAllTours).post(tourController.createNewTour);
// router.route("/:id").get(tourController.getTour).patch(tourController.updateData).delete(tourController.deleteData);

module.exports = router;
