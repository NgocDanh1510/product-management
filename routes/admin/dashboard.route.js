const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const Router = express.Router();
const controller = require("../../controller/admin/dashboard.controller");

Router.get("/", asyncHandler(controller.index));

module.exports = Router;
