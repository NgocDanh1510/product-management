const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const router = express.Router();

const controller = require("../../controller/client/checkout.controller");

router.get("/", asyncHandler(controller.index));
router.post("/order", asyncHandler(controller.order));
router.get("/success/:orderId", asyncHandler(controller.success));
router.get("/order/detail/:orderId", asyncHandler(controller.success));

module.exports = router;
