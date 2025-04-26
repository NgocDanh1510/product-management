const express = require("express");
const asyncHandler = require("../../helper/asyncHandler");

const multer = require("multer");
const upload = multer();

const Router = express.Router();
const controller = require("../../controller/admin/role.controller");

const {
  checkPermission,
} = require("../../middlewares/admin/checkPermission.middleware");

Router.get("/", checkPermission("roles_view"), asyncHandler(controller.index));
Router.get("/create", checkPermission("roles_create"), asyncHandler(controller.create));
Router.post("/create", checkPermission("roles_create"), asyncHandler(controller.createPost));
Router.get(
  "/permission",
  checkPermission("roles_permissions"),
  asyncHandler(controller.permission)
);
Router.patch(
  "/permission",
  checkPermission("roles_permissions"),
  asyncHandler(controller.permissionPatch)
);
Router.get("/edit/:id", checkPermission("roles_edit"), asyncHandler(controller.edit));
Router.patch("/edit/:id", checkPermission("roles_edit"), asyncHandler(controller.editPatch));
Router.get("/detail/:id", checkPermission("roles_view"), asyncHandler(controller.detail));
Router.delete(
  "/delete/:id",
  checkPermission("roles_delete"),
  asyncHandler(controller.delete)
);

module.exports = Router;
