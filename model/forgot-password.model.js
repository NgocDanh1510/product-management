const mongoose = require("mongoose");
// const generateRandom = require("../helper/generateRandom");

const ForgotPasswordSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      // unique: true,
      lowercase: true,
      trim: true,
    },
    otp: String,
    expireAt: { type: Date, expires: 180 },
  },
  { timestamps: true }
);

const ForgotPassword = mongoose.model(
  "ForgotPassword",
  ForgotPasswordSchema,
  "forgotPasswords"
);
module.exports = ForgotPassword;
