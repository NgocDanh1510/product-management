const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const productSchema = new mongoose.Schema(
  {
    title: String,
    product_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
    },
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: String,
    thumbnail: String,
    availabilityStatus: String,
    position: Number,
    isFeatured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
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

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
