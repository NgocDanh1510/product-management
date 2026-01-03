const mongoose = require("mongoose");
// const generateRandom = require("../helper/generateRandom");

const OrderSchema = new mongoose.Schema(
  {
    // user_id: String,

    cart_id: String,
    note: String,
    userInfor: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
    },

    products: [
      {
        product_id: String,
        title: String, // snapshot
        thumbnail: String,
        price: Number, // snapshot
        discountPercentage: Number, // snapshot
        quantity: Number,
      },
    ],

    totalOriginalPrice: Number, // tổng giá gốc
    // totalDiscount: Number, // tổng tiền giảm
    totalPrice: Number, // tiền phải trả

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
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema, "orders");
module.exports = Order;
