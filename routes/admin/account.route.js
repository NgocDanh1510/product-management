const express = require("express");
const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const Router = express.Router();
const controller = require("../../controller/admin/account.controller");

Router.get("/", controller.index);

Router.get("/create", controller.create);

Router.post(
  "/create",
  upload.single("avatar"),
  uploadCloud.upload,
  controller.createPost
);

Router.get("/edit/:id", controller.edit);
Router.patch(
  "/edit/:id",
  upload.single("avatar"),
  uploadCloud.upload,
  controller.editPatch
);

Router.delete("/delete/:id", controller.delete);

module.exports = Router;
