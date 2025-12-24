const PostCategory = require("../../model/post-category.model");
const Acccount = require("../../model/account.model");
const systemPrefix = require("../../config/system");
const createTree = require("../../helper/createTreeCategory.helper");

//[GET] /post-category
module.exports.index = async (req, res) => {
  const find = { deleted: false };
  let sort = { position: "desc" };

  //filter status
  const status = req.query.status;
  if (status) {
    find.status = status;
  }

  //search
  const search = req.query.keyword;
  if (search) {
    const searchRegex = new RegExp(search, "i");
    find.title = searchRegex;
  }

  //sort
  const { sortKey, sortValue } = req.query;
  if (sortKey && sortValue) {
    sort = {};
    sort[sortKey] = sortValue;
  }

  const categories = await PostCategory.find(find).sort(sort);
  //get fullName user update post
  for (const item of categories) {
    if (item.updatedBy) {
      const user = await Acccount.findOne({ _id: item.updatedBy }).select(
        "fullName"
      );
      item.updatedByFullName = user.fullName;
    } else {
      item.updatedByFullName = "";
    }
  }

  const treeCategory =
    status == "inactive" ? categories : createTree(categories);

  // console.log(treeCategory);

  res.render("admin/pages/post-category/index", {
    titlePage: "Danh mục",
    status: status,
    keyword: search,
    listCategory: treeCategory,
  });
};

//[PATCH] /admin/posts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { id, status } = req.params;

  await PostCategory.updateOne(
    { _id: id },
    { status: status, updatedBy: res.locals.user._id }
  );

  req.flash("success", "Cập nhật trạng thái thành công");
  //back lai trang truoc
  const backURL = req.get("Referrer");
  res.redirect(backURL);
};

//[PATCH] /admin/posts/change-multi
module.exports.changeMulti = async (req, res) => {
  const ids = req.body.ids.split(", ");
  switch (req.body.type) {
    case "active":
      ids.forEach(async (e) => {
        await PostCategory.updateOne(
          { _id: e },
          { status: "active", updatedBy: res.locals.user._id }
        );
      });
      req.flash(
        "success",
        `Đã thay đổi trạng thái hoạt động cho ${ids.length} danh mục`
      );
      break;
    case "inactive":
      ids.forEach(async (e) => {
        await PostCategory.updateOne(
          { _id: e },
          { status: "inactive", updatedBy: res.locals.user._id }
        );
      });
      req.flash(
        "success",
        `Đã thay đổi trạng thái dừng cho ${ids.length} danh mục`
      );
      break;
    case "delete":
      ids.forEach(async (e) => {
        await PostCategory.updateOne(
          { _id: e },
          { deleted: true, deletedBy: res.locals.user._id }
        );
      });
      req.flash("success", `Đã xóa ${ids.length} danh mục`);
      break;
    case "Change position":
      ids.forEach(async (e) => {
        let [id, position] = e.split("-");
        position = parseInt(position);
        await PostCategory.updateOne(
          { _id: id },
          { position: position, updatedBy: res.locals.user._id }
        );
      });
      req.flash("success", `Đã thay đổi vị trí cho ${ids.length} danh mục`);
      break;

    default:
      break;
  }

  //back lai trang truoc
  const backURL = req.get("Referrer") || "/posts";
  res.redirect(backURL);
};

//[PATCH] /admin/posts/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;

  await PostCategory.updateOne(
    { _id: id },
    { deleted: true, deletedBy: res.locals.user._id }
  );

  req.flash("success", "xóa danh mục thành công");
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/posts";
  res.redirect(backURL);
};

//[GET] /post-category/create
module.exports.create = async (req, res) => {
  let find = { deleted: false };
  const listCategory = await PostCategory.find(find);

  const treeCategory = createTree(listCategory);

  res.render("admin/pages/post-category/create", {
    titlePage: "Thêm Danh mục",
    listCategory: treeCategory,
  });
};

//[POST] /post-category/create
module.exports.createPostCategory = async (req, res) => {
  if (req.body.position === "") {
    const count = await PostCategory.countDocuments();
    req.body.position = count + 1;
  } else req.body.position = parseInt(req.body.position);

  req.body.createdBy = res.locals.user._id;
  const record = new PostCategory(req.body);
  await record.save();

  req.flash("success", `Đã thêm thành công danh mục sản phẩm `);
  res.redirect(`${systemPrefix.prefixAdmin}/post-category`);
};

//[GET] /post-category/edit
module.exports.edit = async (req, res) => {
  const id = req.params.id;
  const category = await PostCategory.findOne({ _id: id });

  let find = { deleted: false };
  const listCategory = await PostCategory.find(find);
  const treeCategory = createTree(listCategory);

  res.render("admin/pages/post-category/edit", {
    titlePage: "Chỉnh sửa sản phẩm",
    category: category,
    listCategory: treeCategory,
  });
};

//[PATCH] /post-category/edit/:id
module.exports.editPostCategory = async (req, res) => {
  const id = req.params.id;
  if (req.body.position === "") {
    const count = await PostCategory.countDocuments();
    req.body.position = count + 1;
  } else req.body.position = parseInt(req.body.position);

  req.body.updatedBy = res.locals.user._id;

  await PostCategory.updateOne({ _id: id }, req.body);

  req.flash("success", `Đã cập nhật danh mục sản phẩm thành công `);
  res.redirect(`${systemPrefix.prefixAdmin}/post-category`);
};

//[GET] /post-category/detail/:id
module.exports.detail = async (req, res) => {
  id = req.params.id;
  const category = await PostCategory.findOne({ _id: id });

  if (category.updatedBy) {
    const userUpdate = await Acccount.findOne({
      _id: category.updatedBy,
    }).select("fullName");
    category.updatedByFullName = userUpdate.fullName;
  }
  if (category.createdBy) {
    const userCreate = await Acccount.findOne({
      _id: category.createdBy,
    }).select("fullName");

    category.createdByFullName = userCreate.fullName;
  }

  res.render("admin/pages/post-category/detail", {
    titlePage: "chi tiết danh mục",
    category: category,
  });
};
