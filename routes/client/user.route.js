const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/user.controller");

router.get("/login", controller.login);
router.post("/login", controller.loginPost);
router.get("/logout", controller.logout);
router.get("/register", controller.register);
router.post("/register", controller.registerPost);
router.get("/password/forgot", controller.forgot);
router.post("/password/forgot", controller.forgotPost);
router.get("/password/otp", controller.otp);
router.post("/password/otp", controller.otpPost);
router.get("/password/reset", controller.resetPassword);
router.post("/password/reset", controller.resetPasswordPost);

module.exports = router;
