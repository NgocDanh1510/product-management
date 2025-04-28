const mongoose = require("mongoose");
// const generateRandom = require("../helper/generateRandom");

const OrderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    note: String,
    userInfor: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
    },

    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        title: String,
        thumbnail: String,
        price: Number,
        discountPercentage: Number,
        quantity: Number,
      },
    ],
    totalOriginalPrice: Number,
    totalPrice: Number,

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bank", "momo", "vnpay", "paypal"],
      default: "cod",
    },

    // paymentStatus: {
    //   type: String,
    //   enum: ["unpaid", "paid", "failed"],
    //   default: "unpaid",
    // },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema, "orders");
module.exports = Order;
