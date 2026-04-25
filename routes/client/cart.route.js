const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const router = express.Router();

const controller = require("../../controller/client/cart.controller");

router.get("/", asyncHandler(controller.index));
router.post("/add-cart/:productId", asyncHandler(controller.addCart));
router.get("/delete/:productId", asyncHandler(controller.delete));
router.patch("/update/:productId/:quantity", asyncHandler(controller.updateQuantity));

module.exports = router;
