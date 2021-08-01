const express = require("express");

const UserController = require("./../controllers/userControler");
const AuthController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);
router.post("/forgetpassword", AuthController.forgotPassword);
router.patch("/resetpassword/:token", AuthController.resetPassword);

//// use protect all router after this middle ware
router.use(AuthController.protect); //this applucable for all next middle wares

router.get("/me", UserController.getMe, UserController.getUser);
router.patch("/updateMyPassword", AuthController.updatePassword);
router.patch("/updateMe", UserController.uploadUserPhoto, UserController.resizeUserPhoto, UserController.updateMe);
router.patch("/deleteMe", UserController.deleteMe);

router.param("id", (req, res, next, val) => {
  console.log(`user id is : ${val}`);
  next();
});

//example
// router.route("/").get(AuthController.protect, AuthController.restrictTo("admin", "lead-guide"), UserController.getAllUsers).post(UserController.createUser);

///restrict thisafter the middleware
router.use(AuthController.restrictTo("admin", "lead-guide"));

router.route("/").get(UserController.getAllUsers).post(UserController.createUser);

router.route("/:id").get(UserController.getUser).patch(UserController.updateUser).delete(UserController.deleteUser);

module.exports = router;
