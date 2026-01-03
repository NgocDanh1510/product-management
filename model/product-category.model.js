const mongoose = require("mongoose");
const slub = require("mongoose-slug-updater");
mongoose.plugin(slub);
const productCategoryShema = new mongoose.Schema(
  {
    title: String,
    description: String,
    parent_id: {
      type: String,
      default: "",
    },
    thumbnail: String,
    status: String,
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
    createdBy: String,
    updatedBy: String,
    deletedBy: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);
const ProductCategory = mongoose.model(
  "ProductCategory",
  productCategoryShema,
  "product-category"
);

module.exports = ProductCategory;
