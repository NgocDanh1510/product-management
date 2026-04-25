const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const router = express.Router();
const controller = require("../../controller/client/post.controller");

router.get("/", asyncHandler(controller.index));

router.get("/:slug", asyncHandler(controller.detail));

module.exports = router;
