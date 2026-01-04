const Post = require("../../model/post.model");
const PostCategory = require("../../model/post-category.model");
const paginationHelper = require("../../helper/pagination");
const { post } = require("../../routes/client/post.route");

module.exports.index = async (req, res) => {
  try {
    // ===== FILTER =====
    const filters = {
      deleted: false,
      status: "active",
    };

    // Lọc theo danh mục
    const selectedCategory = req.query.category || "";
    if (selectedCategory) {
      const category = await PostCategory.findOne({
        slug: selectedCategory,
        deleted: false,
        status: "active",
      });
      if (category) {
        filters.post_category_id = category._id;
      }
    }

    // ===== PAGINATION =====
    const objectPagination = await paginationHelper(
      {
        currentPage: 1,
        limitPage: 6,
      },
      req.query,
      Post,
      filters
    );

    // ===== LẤY BÀI VIẾT NỔI BẬT =====
    const featuredPost = await Post.findOne({
      deleted: false,
      status: "active",
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .select("title description thumbnail slug createdAt views");

    // Nếu có featured post, thêm category name
    if (featuredPost && featuredPost.post_category_id) {
      const category = await PostCategory.findById(
        featuredPost.post_category_id
      );
      if (category) {
        featuredPost.category = category.title;
      }
    }

    // ===== LẤY DANH SÁCH BÀI VIẾT =====
    let listPosts = await Post.find(filters)
      .sort({ position: 1, createdAt: -1 })
      .limit(objectPagination.limitPage)
      .skip(objectPagination.skipPage)
      .select(
        "title description thumbnail slug createdAt views post_category_id"
      );

    // Thêm tên danh mục cho mỗi bài viết
    for (let post of listPosts) {
      if (post.post_category_id) {
        const category = await PostCategory.findById(post.post_category_id);
        if (category) {
          post.category = category.title;
        }
      }
    }

    // ===== LẤY DANH SÁCH DANH MỤC =====client/pages
    const postCategories = await PostCategory.find({
      deleted: false,
      status: "active",
    })
      .sort({ position: 1 })
      .select("title slug");

    // ===== RENDER =====
    res.render("client/pages/posts/index", {
      pageTitle: "Tin tức - Mega Mart",
      listPosts: listPosts,
      featuredPost: featuredPost,
      postCategories: postCategories,
      selectedCategory: selectedCategory,
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Error in posts controller:", error);
    res.redirect("/");
  }
};

// ===== CHI TIẾT BÀI VIẾT =====
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;

    // Tìm bài viết theo slug
    const post = await Post.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });

    if (!post) {
      req.flash("error", "Bài viết không tồn tại!");
      return res.redirect("/posts");
    }

    // Tăng view count (nếu có field views trong model)
    // await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });

    // Lấy tên danh mục
    if (post.post_category_id) {
      const category = await PostCategory.findById(post.post_category_id);
      if (category) {
        post.category = category.title;
      }
    }

    // Tính thời gian đọc (ước tính: 200 từ/phút)
    const wordCount = post.content ? post.content.split(" ").length : 0;
    post.readTime = Math.ceil(wordCount / 200);

    // ===== BÀI VIẾT LIÊN QUAN (cùng danh mục) =====
    const relatedPosts = await Post.find({
      post_category_id: post.post_category_id,
      _id: { $ne: post._id },
      deleted: false,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .select("title description thumbnail slug createdAt");

    // ===== BÀI VIẾT NỔI BẬT (sidebar) =====
    const featuredPosts = await Post.find({
      deleted: false,
      status: "active",
      isFeatured: true,
      _id: { $ne: post._id },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title thumbnail slug createdAt");

    // ===== BÀI VIẾT MỚI NHẤT (sidebar) =====
    const latestPosts = await Post.find({
      deleted: false,
      status: "active",
      _id: { $ne: post._id },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title thumbnail slug createdAt");

    // ===== URL HIỆN TẠI (cho share buttons) =====
    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    // ===== RENDER =====
    res.render("client/pages/posts/detail", {
      pageTitle: post.title,
      post: post,
      relatedPosts: relatedPosts,
      featuredPosts: featuredPosts,
      latestPosts: latestPosts,
      currentUrl: encodeURIComponent(currentUrl),
    });
  } catch (error) {
    console.error("Error in post detail:", error);
    res.redirect("/posts");
  }
};

// ===== TÌM KIẾM BÀI VIẾT (optional) =====
// module.exports.search = async (req, res) => {
//   try {
//     const keyword = req.query.keyword || "";

//     const filters = {
//       deleted: false,
//       status: "active",
//     };

//     if (keyword) {
//       const regex = new RegExp(keyword, "i");
//       filters.$or = [
//         { title: regex },
//         { description: regex },
//         { content: regex },
//       ];
//     }

//     const listPosts = await Post.find(filters)
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .select("title description thumbnail slug createdAt");

//     // Thêm category cho mỗi post
//     for (let post of listPosts) {
//       if (post.post_category_id) {
//         const category = await PostCategory.findById(post.post_category_id);
//         if (category) {
//           post.category = category.title;
//         }
//       }
//     }

//     res.render("client/pages/posts/search", {
//       pageTitle: `Tìm kiếm: ${keyword}`,
//       keyword: keyword,
//       listPosts: listPosts,
//     });
//   } catch (error) {
//     console.error("Error in post search:", error);
//     res.redirect("/posts");
//   }
// };
