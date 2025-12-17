const mongoose = require("mongoose");
const generateRandom = require("../helper/generateRandom");

const accountSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    avatar: String,
    password: String,
    token: {
      type: String,
      default: generateRandom.randomString(30),
    },
    role_id: String,
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

const Account = mongoose.model("Account", accountSchema, "accounts");
module.exports = Account;
