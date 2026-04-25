const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const router = express.Router();

const controller = require("../../controller/client/order.controller");

router.get("/", asyncHandler(controller.index));

router.get("/detail/:orderId", asyncHandler(controller.detail));

module.exports = router;
