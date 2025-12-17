const express = require("express");
const Router = express.Router();
const controller = require("../../controller/admin/auth.controller");

Router.get("/login", controller.login);
Router.post("/login", controller.loginPost);
Router.get("/logout", controller.logout);

module.exports = Router;
