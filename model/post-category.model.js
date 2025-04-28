const mongoose = require("mongoose");
const slub = require("mongoose-slug-updater");
mongoose.plugin(slub);
const postCategoryShema = new mongoose.Schema(
  {
    title: String,
    description: String,
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostCategory",
      default: null,
    },
    thumbnail: String,
    status: String,
    position: Number,
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
const PostCategory = mongoose.model(
  "PostCategory",
  postCategoryShema,
  "post-category"
);

module.exports = PostCategory;
