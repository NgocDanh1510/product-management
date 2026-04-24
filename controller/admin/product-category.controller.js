const ProductCategory = require("../../model/product-category.model");
const Acccount = require("../../model/account.model");
const systemPrefix = require("../../config/system");
const createTree = require("../../helper/createTreeCategory.helper");

//[GET] /product-category
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

  const categories = await ProductCategory.find(find).sort(sort);
  //get fullName user update product
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

  res.render("admin/pages/product-category/index", {
    titlePage: "Danh mục",
    status: status,
    keyword: search,
    listCategory: treeCategory,
  });
};

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await ProductCategory.updateOne(
    { _id: id },
    { status: status, updatedBy: res.locals.user._id }
  );

  req.flash("success", "Cập nhật trạng thái thành công");
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const ids = req.body.ids.split(", ");
  switch (req.body.type) {
    case "active":
      ids.forEach(async (e) => {
        await ProductCategory.updateOne(
          { _id: e },
          { status: "active", updatedBy: res.locals.user._id }
        );
      });
      req.flash(
        "success",
        `Đã thay đổi trạng thái Còn Hàng cho ${ids.length} danh mục`
      );
      break;
    case "inactive":
      ids.forEach(async (e) => {
        await ProductCategory.updateOne(
          { _id: e },
          { status: "inactive", updatedBy: res.locals.user._id }
        );
      });
      req.flash(
        "success",
        `Đã thay đổi trạng thái Hết Hàng cho ${ids.length} danh mục`
      );
      break;
    case "delete":
      ids.forEach(async (e) => {
        await ProductCategory.updateOne(
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
        await ProductCategory.updateOne(
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
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};

//[PATCH] /admin/products/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;

  await ProductCategory.updateOne(
    { _id: id },
    { deleted: true, deletedBy: res.locals.user._id }
  );

  req.flash("success", "xóa danh mục thành công");
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};

//[GET] /product-category/create
module.exports.create = async (req, res) => {
  let find = { deleted: false };
  const listCategory = await ProductCategory.find(find);

  const treeCategory = createTree(listCategory);

  res.render("admin/pages/product-category/create", {
    titlePage: "Thêm Danh mục",
    listCategory: treeCategory,
  });
};

//[POST] /product-category/create
module.exports.createProductCategory = async (req, res) => {
  const categoryData = {
    title: req.body.title,
    description: req.body.description,
    parent_id: req.body.parent_id,
    thumbnail: req.body.thumbnail,
    status: req.body.status,
    isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
    createdBy: res.locals.user._id,
  };

  if (req.body.position === "") {
    const count = await ProductCategory.countDocuments();
    categoryData.position = count + 1;
  } else {
    categoryData.position = parseInt(req.body.position);
  }

  const record = new ProductCategory(categoryData);
  await record.save();

  req.flash("success", `Đã thêm thành công danh mục sản phẩm `);
  res.redirect(`${systemPrefix.prefixAdmin}/product-category`);
};

//[GET] /product-category/edit
module.exports.edit = async (req, res) => {
  const id = req.params.id;
  const category = await ProductCategory.findOne({ _id: id });

  let find = { deleted: false };
  const listCategory = await ProductCategory.find(find);
  const treeCategory = createTree(listCategory);

  res.render("admin/pages/product-category/edit", {
    titlePage: "Chỉnh sửa sản phẩm",
    category: category,
    listCategory: treeCategory,
  });
};

//[PATCH] /product-category/edit/:id
module.exports.editProductCategory = async (req, res) => {
  const id = req.params.id;
  const updateData = {
    title: req.body.title,
    description: req.body.description,
    parent_id: req.body.parent_id,
    thumbnail: req.body.thumbnail,
    status: req.body.status,
    isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
    updatedBy: res.locals.user._id,
  };

  if (req.body.position === "") {
    const count = await ProductCategory.countDocuments();
    updateData.position = count + 1;
  } else {
    updateData.position = parseInt(req.body.position);
  }

  await ProductCategory.updateOne({ _id: id }, updateData);

  req.flash("success", `Đã cập nhật danh mục sản phẩm thành công `);
  res.redirect(`${systemPrefix.prefixAdmin}/product-category`);
};

//[GET] /product-category/detail/:id
module.exports.detail = async (req, res) => {
  id = req.params.id;
  const category = await ProductCategory.findOne({ _id: id });

  if (category.updatedBy) {
    const user = await Acccount.findOne({ _id: category.updatedBy }).select(
      "fullName"
    );
    category.updatedByFullName = user.fullName;
  }
  if (category.createdBy) {
    const user = await Acccount.findOne({ _id: category.createdBy }).select(
      "fullName"
    );
    category.createdByFullName = user.fullName;
  }

  res.render("admin/pages/product-category/detail", {
    titlePage: "chi tiết danh mục",
    category: category,
  });
};

// module.exports.test = async (req, res) => {
//   const products = await ProductCategory.find({});

//   for (const e of products) {
//     await ProductCategory.updateOne({ _id: e._id }, { title: e.title });
//   }

//   res.send("Done");
// };
