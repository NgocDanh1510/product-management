const express = require("express");
const Router = express.Router();
const controller = require("../../controller/admin/setting.controller");
const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

Router.get("/", controller.general);
Router.patch(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  uploadCloud.uploadFields,
  controller.generalPatch
);

module.exports = Router;
