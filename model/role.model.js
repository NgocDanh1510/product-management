const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    permissions: {
      type: Array,
      default: [], // danh sách quyền: ["product_create", "product_edit", ...]
    },
    status: {
      type: String,
      default: "active", // active | inactive
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema, "roles");
module.exports = Role;
