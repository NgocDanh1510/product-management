const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  discountPercentage: Number,
  stock: String,
  thumbnail: String,
  availabilityStatus: String,
});

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
