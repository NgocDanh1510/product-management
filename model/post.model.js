const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const postSchema = new mongoose.Schema(
  {
    title: String,
    post_category_id: {
      type: String,
      default: "",
    },
    description: String,
    content: String,
    thumbnail: String,
    status: {
      type: String,
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    position: Number,
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

const Post = mongoose.model("Post", postSchema, "posts");

module.exports = Post;
