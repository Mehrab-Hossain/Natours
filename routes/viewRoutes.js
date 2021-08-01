const express = require("express");
const viewController = require("./../controllers/viewController");
const authController = require("./../controllers/authController");

const router = express();

//
//for all tour
router.get("/", authController.isLogin, viewController.getOverview);
//inside a tour
router.get("/tours/:slug", authController.isLogin, viewController.getTour);
//login
router.get("/login", authController.isLogin, viewController.getloginForm);
router.get("/me", authController.protect, viewController.getAccount);
router.post("/submit-user-data", authController.protect, viewController.updateUserData);

module.exports = router;
