const express = require("express");
const multer = require("multer");
const upload = multer();

const Router = express.Router();
const controller = require("../../controller/admin/role.controller");

Router.get("/", controller.index);
Router.get("/create", controller.create);
Router.post("/create", controller.createPost);
Router.get("/permission", controller.permission);
Router.patch("/permission", controller.permissionPatch);
Router.get("/edit/:id", controller.edit);
Router.patch("/edit/:id", controller.editPatch);
Router.get("/detail/:id", controller.detail);
Router.delete("/delete/:id", controller.delete);

module.exports = Router;
