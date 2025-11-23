const express = require("express");
const controller = require("../../controller/admin/product.controller");

const Router = express.Router();
Router.get("/", controller.index);

module.exports = Router;
