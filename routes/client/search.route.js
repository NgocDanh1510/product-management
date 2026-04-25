const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const router = express.Router();

const controller = require("../../controller/client/search.controller");

router.get("/", asyncHandler(controller.index));

module.exports = router;
