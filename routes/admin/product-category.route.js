const express = require("express");
const controller = require("../../controller/admin/product-category.controller");
// const validate = require("../../validates/admin/product.validate");
const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const Router = express.Router();
Router.get("/", controller.index);

Router.patch("/change-status/:status/:id", controller.changeStatus);

Router.delete("/delete/:id", controller.delete);

Router.patch("/change-multi", controller.changeMulti);

Router.get("/create", controller.create);

Router.post(
  "/create",
  upload.single("thumbnail"),
  uploadCloud.upload,
  controller.createProductCategory
);

Router.get("/edit/:id", controller.edit);
Router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  uploadCloud.upload,
  controller.editProductCategory
);

Router.get("/detail/:id", controller.detail);
module.exports = Router;
