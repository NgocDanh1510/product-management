const ProductCategory = require("../../model/product-category.model");
const systemPrefix = require("../../config/system");
const createTree = require("../../helper/createTreeCategory.helper");

//[GET] /product-category
module.exports.index = async (req, res) => {
  const find = { deleted: false };
  let sort = { position: "desc" };
  const status = req.query.status;
  if (status) {
    find.status = status;
  }
  const search = req.query.keyword;
  if (search) {
    const searchRegex = new RegExp(search, "i");
    find.title = searchRegex;
  }
  const { sortKey, sortValue } = req.query;
  if (sortKey && sortValue) {
    sort = {};
    sort[sortKey] = sortValue;
  }

  const categories = await ProductCategory.find(find).sort(sort);
  const treeCategory = createTree(categories);

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

  await ProductCategory.updateOne({ _id: id }, { status: status });

  req.flash("success", "Cập nhật trạng thái thành công");
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};
//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  console.log(req.body);
  const ids = req.body.ids.split(", ");
  switch (req.body.type) {
    case "In Stock":
      ids.forEach(async (e) => {
        await ProductCategory.updateOne({ _id: e }, { status: "In Stock" });
      });
      req.flash(
        "success",
        `Đã thay đổi trạng thái Còn Hàng cho ${ids.length} danh mục`
      );
      break;
    case "Low Stock":
      ids.forEach(async (e) => {
        await ProductCategory.updateOne({ _id: e }, { status: "Low Stock" });
      });
      req.flash(
        "success",
        `Đã thay đổi trạng thái Hết Hàng cho ${ids.length} danh mục`
      );
      break;
    case "delete":
      ids.forEach(async (e) => {
        await ProductCategory.updateOne({ _id: e }, { deleted: true });
      });
      req.flash("success", `Đã xóa ${ids.length} danh mục`);
      break;
    case "Change position":
      ids.forEach(async (e) => {
        let [id, position] = e.split("-");
        position = parseInt(position);
        await ProductCategory.updateOne({ _id: id }, { position: position });
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
//[PATCH] /admin/products/change-status/:status/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;

  await ProductCategory.updateOne({ _id: id }, { deleted: true });

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
  if (req.body.position === "") {
    const count = await ProductCategory.countDocuments();
    req.body.position = count + 1;
  } else req.body.position = parseInt(req.body.position);
  const record = new ProductCategory(req.body);
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
  if (req.body.position === "") {
    const count = await ProductCategory.countDocuments();
    req.body.position = count + 1;
  } else req.body.position = parseInt(req.body.position);
  await ProductCategory.updateOne({ _id: id }, req.body);

  req.flash("success", `Đã cập nhật danh mục sản phẩm thành công `);
  res.redirect(`${systemPrefix.prefixAdmin}/product-category`);
};

//[GET] /product-category/detail/:id
module.exports.detail = async (req, res) => {
  id = req.params.id;
  const category = await ProductCategory.findOne({ _id: id });

  res.render("admin/pages/product-category/detail", {
    titlePage: "chi tiết danh mục",
    category: category,
  });
};
