const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const controller = require("../../controller/admin/post.controller");
const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const {
  checkPermission,
} = require("../../middlewares/admin/checkPermission.middleware");

const Router = express.Router();

Router.get("/", checkPermission("posts_view"), asyncHandler(controller.index));

Router.patch(
  "/change-status/:status/:id",
  checkPermission("posts_edit"),
  asyncHandler(controller.changeStatus)
);

Router.patch(
  "/change-multi",
  checkPermission("posts_edit"),
  asyncHandler(controller.changeMulti)
);

Router.delete(
  "/delete/:id",
  checkPermission("posts_delete"),
  asyncHandler(controller.delete)
);

Router.get("/create", checkPermission("posts_create"), asyncHandler(controller.create));

Router.post(
  "/create",
  checkPermission("posts_create"),
  upload.single("thumbnail"),
  uploadCloud.upload,
  asyncHandler(controller.createPost)
);

Router.get("/edit/:id", checkPermission("posts_edit"), asyncHandler(controller.edit));

Router.patch(
  "/edit/:id",
  checkPermission("posts_edit"),
  upload.single("thumbnail"),
  uploadCloud.upload,
  asyncHandler(controller.editPost)
);

Router.get("/detail/:id", checkPermission("posts_view"), asyncHandler(controller.detail));
Router.get("/test", asyncHandler(controller.test));
module.exports = Router;
