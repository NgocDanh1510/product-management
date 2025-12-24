const express = require("express");
const controller = require("../../controller/admin/post-category.controller");
// const validate = require("../../validates/admin/post.validate");
const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const {
  checkPermission,
} = require("../../middlewares/admin/checkPermission.middleware");

const Router = express.Router();
Router.get("/", checkPermission("posts-category_view"), controller.index);

Router.patch(
  "/change-status/:status/:id",
  checkPermission("posts-category_edit"),
  controller.changeStatus
);

Router.delete(
  "/delete/:id",
  checkPermission("posts-category_delete"),
  controller.delete
);

Router.patch(
  "/change-multi",
  checkPermission("posts-category_edit"),
  controller.changeMulti
);

Router.get(
  "/create",
  checkPermission("posts-category_create"),
  controller.create
);

Router.post(
  "/create",
  checkPermission("posts-category_create"),
  upload.single("thumbnail"),
  uploadCloud.upload,
  controller.createPostCategory
);

Router.get(
  "/edit/:id",
  checkPermission("posts-category_edit"),
  controller.edit
);
Router.patch(
  "/edit/:id",
  checkPermission("posts-category_edit"),
  upload.single("thumbnail"),
  uploadCloud.upload,
  controller.editPostCategory
);

Router.get(
  "/detail/:id",
  checkPermission("posts-category_view"),
  controller.detail
);
module.exports = Router;
