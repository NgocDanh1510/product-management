const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const Router = express.Router();
const controller = require("../../controller/admin/setting.controller");
const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const {
  checkPermission,
} = require("../../middlewares/admin/checkPermission.middleware");

Router.get("/", checkPermission("settings_view"), asyncHandler(controller.general));
Router.patch(
  "/",
  checkPermission("settings_edit"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  uploadCloud.uploadFields,
  asyncHandler(controller.generalPatch)
);

module.exports = Router;
