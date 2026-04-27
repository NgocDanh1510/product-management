const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");
const validate = require("../../validates/validate.middleware");
const accountSchema = require("../../validates/schemas/account.schema");

const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const Router = express.Router();
const controller = require("../../controller/admin/account.controller");

const {
  checkPermission,
} = require("../../middlewares/admin/checkPermission.middleware");

Router.get("/", checkPermission("accounts_view"), asyncHandler(controller.index));

Router.get("/create", checkPermission("accounts_create"), asyncHandler(controller.create));

Router.post(
  "/create",
  checkPermission("accounts_create"),
  upload.single("avatar"),
  uploadCloud.upload,
  validate(accountSchema),
  asyncHandler(controller.createPost)
);

Router.get("/edit/:id", checkPermission("accounts_edit"), asyncHandler(controller.edit));
Router.patch(
  "/edit/:id",
  checkPermission("accounts_edit"),
  upload.single("avatar"),
  uploadCloud.upload,
  validate(accountSchema),
  asyncHandler(controller.editPatch)
);

Router.delete(
  "/delete/:id",
  checkPermission("accounts_delete"),
  asyncHandler(controller.delete)
);

module.exports = Router;
