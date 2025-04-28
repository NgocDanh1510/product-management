const Post = require("../../model/post.model");
const PostCategory = require("../../model/post-category.model");
const Acccount = require("../../model/account.model");
const { prefixAdmin } = require("../../config/system");
const paginationHelper = require("../../helper/pagination");
const createTree = require("../../helper/createTreeCategory.helper");
//[GET] /admin/posts
module.exports.index = async (req, res) => {
  const find = { deleted: false };
  const sort = { position: "desc" };
  //?status
  if (req.query.status) {
    find.status = req.query.status;
  }

  //?search
  const keyword = req.query.keyword;
  if (req.query.keyword) {
    find.title = new RegExp(`${keyword}`, "i");
  }

  //sort
  const { sortKey, sortValue } = req.query;
  if (sortKey && sortValue) {
    delete sort.position;
    sort[sortKey] = sortValue;
  }

  //pagination
  const pagination = await paginationHelper(
    { limitPage: 5, currentPage: 1 },
    req.query,
    Post,
    find,
  );

  const posts = await Post.find(find)
    .populate("createdBy", "fullName")
    .sort(sort)
    .limit(pagination.limitPage)
    .skip(pagination.skipPage).lean();

  for (const element of posts) {
    if (element.createdBy) {
      element.createdByFullName = element.createdBy.fullName;
    } else element.createdByFullName = "";
  }

  res.render("admin/pages/posts/index", {
    titlePage: "Quản lý bài viết",
    listPosts: posts,
    status: req.query.status,
    keyword: keyword,
    pagination: pagination,
  });
};

//[PATCH] /admin/posts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const { status, id } = req.params;

    await Post.updateOne(
      { _id: id },
      { status: status, updatedBy: res.locals.user.id },
    );
    req.flash("success", `thay đổi trạng thái thành công`);
  } catch (error) {
    console.log(error);
    req.flash("error", `Thao tác thất bại`);
  }
  const { status, id } = req.params;

  await Post.updateOne(
    { _id: id },
    { status: status, updatedBy: res.locals.user.id },
  );

  //back trang truoc
  const backURL = req.get("Referrer");
  res.redirect(backURL);
};

//[DELETE] /admin/posts/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    await Post.updateOne(
      { _id: id },
      { deleted: true, deletedBy: res.locals.user.id },
    );
    req.flash("success", `đã xóa thành công`);
  } catch (error) {
    console.log(error);
    req.flash("error", `Thao tác thất bại`);
  }

  //back trang truoc
  const backURL = req.get("Referrer");
  res.redirect(backURL);
};

//[PATCH] /admin/posts/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { type } = req.body;
    const ids = req.body.ids.split(", ");

    switch (type) {
      case "active":
        await Post.updateMany(
          { _id: { $in: ids } },
          { status: "active", updatedBy: res.locals.user.id },
        );
        req.flash("success", `đã cập nhật trạng thái ${ids.length} bài viết`);
        break;
      case "inactive":
        await Post.updateMany(
          { _id: { $in: ids } },
          { status: "inactive", updatedBy: res.locals.user.id },
        );
        req.flash("success", `đã cập nhật trạng thái ${ids.length} bài viết`);
        break;
      case "delete":
        await Post.updateMany(
          { _id: { $in: ids } },
          { deleted: true, daletedBy: res.locals.user.id },
        );
        req.flash("success", `đã xóa ${ids.length} bài viết`);
        break;
      case "Change position":
        for (const element of ids) {
          const [id, position] = element.split("-");
          await Post.updateOne(
            { _id: id },
            { position: position, updatedBy: res.locals.user.id },
          );
        }
        req.flash("success", `đã cập nhật vị trí ${ids.length} bài viết`);
        break;

      default:
        break;
    }
  } catch (error) {
    console.log(error);
    req.flash("error", `Thao tác thất bại`);
  }

  //back trang truoc
  const backURL = req.get("Referrer");
  res.redirect(backURL);
};

//[GET] /admin/posts/create
module.exports.create = async (req, res) => {
  const categories = await PostCategory.find({ deleted: false }).lean();
  const treeCategory = createTree(categories);
  res.render("admin/pages/posts/create", {
    titlePage: "Thêm bài viết",
    listCategory: treeCategory,
  });
};
//[POST] /admin/posts/create
module.exports.createPost = async (req, res) => {
  try {
    const postData = {
      title: req.body.title,
      post_category_id: req.body.post_category_id,
      description: req.body.description,
      content: req.body.content,
      thumbnail: req.body.thumbnail,
      status: req.body.status,
      isFeatured:
        req.body.isFeatured === "true" || req.body.isFeatured === true,
      createdBy: res.locals.user.id,
    };

    if (!req.body.position) {
      const countPost = await Post.countDocuments();
      postData.position = countPost + 1;
    } else {
      postData.position = parseInt(req.body.position);
    }

    const newPost = new Post(postData);
    await newPost.save();

    req.flash("success", `Thêm bài viết thành công`);
    res.redirect(`${prefixAdmin}/posts`);
  } catch (error) {
    console.log(error);
    req.flash("error", `Thao tác thất bại`);
    //back trang truoc
    const backURL = req.get("Referrer");
    res.redirect(backURL);
  }
};

//[GET] /admin/posts/edit/:id
module.exports.edit = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id }).lean();
  const categories = await PostCategory.find({ deleted: false }).lean();
  const treeCategory = createTree(categories);
  res.render("admin/pages/posts/edit", {
    titlePage: "Sửa bài viết",
    listCategory: treeCategory,
    post: post,
  });
};
//[PATCH] /admin/posts/edit/:id
module.exports.editPost = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      post_category_id: req.body.post_category_id,
      description: req.body.description,
      content: req.body.content,
      thumbnail: req.body.thumbnail,
      status: req.body.status,
      isFeatured:
        req.body.isFeatured === "true" || req.body.isFeatured === true,
      updatedBy: res.locals.user.id,
    };

    if (!req.body.position) {
      const countPost = await Post.countDocuments();
      updateData.position = countPost + 1;
    } else {
      updateData.position = parseInt(req.body.position);
    }

    await Post.updateOne({ _id: req.params.id }, updateData);

    req.flash("success", `cập nhật bài viết thành công`);
  } catch (error) {
    console.log(error);
    req.flash("error", `Thao tác thất bại`);
  }
  //back trang truoc
  const backURL = req.get("Referrer");
  res.redirect(backURL);
};
//[GET] /admin/posts/detail/:id
module.exports.detail = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id }).lean();

  if (post.createdBy) {
    const account = await Acccount.findOne({ _id: post.createdBy }).select(
      "fullName",
    ).lean();
    post.createdByFullName = account.fullName;
  } else post.createdByFullName = "";

  if (post.updatedBy) {
    const account = await Acccount.findOne({ _id: post.updatedBy }).select(
      "fullName",
    ).lean();
    post.updatedByFullName = account.fullName;
  } else post.updatedByFullName = "";

  res.render("admin/pages/posts/detail", {
    titlePage: "Chi Tiết bài viết",
    post: post,
  });
};

module.exports.test = async (req, res) => {
  const post = await Post.find({}).lean();
  const postJSON = JSON.stringify(post);
  res.send(postJSON);
};
