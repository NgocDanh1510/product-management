const mongoose = require("mongoose");
// const generateRandom = require("../helper/generateRandom");

const CartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],

    expiresAt: {
      type: Date,
      default: null,
      index: { expires: 0 }, // TTL INDEX
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", CartSchema, "carts");
module.exports = Cart;
