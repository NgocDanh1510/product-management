const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const controller = require("../../controller/admin/product-category.controller");
// const validate = require("../../validates/admin/product.validate");
const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const {
  checkPermission,
} = require("../../middlewares/admin/checkPermission.middleware");

const Router = express.Router();
Router.get("/", checkPermission("products-category_view"), asyncHandler(controller.index));

Router.patch(
  "/change-status/:status/:id",
  checkPermission("products-category_edit"),
  asyncHandler(controller.changeStatus)
);

Router.delete(
  "/delete/:id",
  checkPermission("products-category_delete"),
  asyncHandler(controller.delete)
);

Router.patch(
  "/change-multi",
  checkPermission("products-category_edit"),
  asyncHandler(controller.changeMulti)
);

Router.get(
  "/create",
  checkPermission("products-category_create"),
  asyncHandler(controller.create)
);

Router.post(
  "/create",
  checkPermission("products-category_create"),
  upload.single("thumbnail"),
  uploadCloud.upload,
  asyncHandler(controller.createProductCategory)
);

Router.get(
  "/edit/:id",
  checkPermission("products-category_edit"),
  asyncHandler(controller.edit)
);
Router.patch(
  "/edit/:id",
  checkPermission("products-category_edit"),
  upload.single("thumbnail"),
  uploadCloud.upload,
  asyncHandler(controller.editProductCategory)
);

Router.get(
  "/detail/:id",
  checkPermission("products-category_view"),
  asyncHandler(controller.detail)
);
// Router.get("/test", asyncHandler(controller.test));
module.exports = Router;
