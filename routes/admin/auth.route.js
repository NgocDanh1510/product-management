const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const Router = express.Router();
const controller = require("../../controller/admin/auth.controller");

Router.get("/login", asyncHandler(controller.login));
Router.post("/login", asyncHandler(controller.loginPost));
Router.get("/logout", asyncHandler(controller.logout));

module.exports = Router;
