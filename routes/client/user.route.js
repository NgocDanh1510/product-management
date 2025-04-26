const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const router = express.Router();

const controller = require("../../controller/client/user.controller");

router.get("/login", asyncHandler(controller.login));
router.post("/login", asyncHandler(controller.loginPost));
router.get("/logout", asyncHandler(controller.logout));
router.get("/register", asyncHandler(controller.register));
router.post("/register", asyncHandler(controller.registerPost));
router.get("/password/forgot", asyncHandler(controller.forgot));
router.post("/password/forgot", asyncHandler(controller.forgotPost));
router.get("/password/otp", asyncHandler(controller.otp));
router.post("/password/otp", asyncHandler(controller.otpPost));
router.get("/password/reset", asyncHandler(controller.resetPassword));
router.post("/password/reset", asyncHandler(controller.resetPasswordPost));
router.get("/info", asyncHandler(controller.info));
router.patch("/info", asyncHandler(controller.updateInfo));

module.exports = router;
