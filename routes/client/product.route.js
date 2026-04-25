const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const router = express.Router();

const controller = require("../../controller/client/product.controller");

router.get("/", asyncHandler(controller.index));
router.get("/detail/:slug", asyncHandler(controller.detail));
router.get("/:slugCategory", asyncHandler(controller.productCategory));

module.exports = router;
