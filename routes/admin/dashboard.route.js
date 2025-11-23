const express = require("express");
const Router = express.Router();
const controller = require("../../controller/admin/dashboard.controller");

Router.get("/", controller.index);

module.exports = Router;
