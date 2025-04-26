const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const Router = express.Router();

const controller = require("../../controller/admin/order.controller");

Router.get("/", asyncHandler(controller.index));
Router.patch("/change-status/:status/:id", asyncHandler(controller.changeStatus));
Router.get("/detail/:id", asyncHandler(controller.detail));

module.exports = Router;
