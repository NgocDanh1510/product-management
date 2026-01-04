const Product = require("../../model/product.model");
const productCategory = require("../../model/product-category.model");
const Acccount = require("../../model/account.model");

const paginationHelper = require("../../helper/pagination");
const createTree = require("../../helper/createTreeCategory.helper");
const systemConfig = require("../../config/system");
//[GET] /admin/products
module.exports.index = async (req, res) => {
  const find = { deleted: false };
  let sort = { position: "desc" };
  //?status =
  const availabilityStatus = req.query.status;
  if (availabilityStatus) {
    find.availabilityStatus = availabilityStatus;
  }

  //?keyword =
  const keyword = req.query.keyword;
  if (keyword) {
    const keyRegex = new RegExp(keyword, "i");
    find.title = keyRegex;
  }

  //?page=
  const objectPagination = await paginationHelper(
    {
      currentPage: 1,
      limitPage: 5,
    },
    req.query,
    Product,
    find
  );

  //??sortKey=  &sortValue=
  const sortKey = req.query.sortKey;
  const sortValue = req.query.sortValue;

  if (sortKey) {
    sort = {};
    sort[sortKey] = sortValue;
  }

  const products = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitPage)
    .skip(objectPagination.skipPage);

  //get fullName user update product
  for (const product of products) {
    if (product.updatedBy) {
      const user = await Acccount.findOne({ _id: product.updatedBy }).select(
        "fullName"
      );
      product.updatedByFullName = user.fullName;
    } else {
      product.updatedByFullName = "";
    }
  }

  res.render("admin/pages/products/index", {
    titlePage: "ProductAdmin",
    listProduct: products,
    status: availabilityStatus,
    keyword: keyword,
    pagination: objectPagination,
  });
};

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne(
    { _id: id },
    { availabilityStatus: status, updatedBy: res.locals.user._id }
  );

  req.flash("success", "Cập nhật trạng thái thành công");
  //back lai trang truoc
  const backURL = req.get("Referrer");
  res.redirect(backURL);
};
//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
      case "In Stock":
        await Product.updateMany(
          { _id: { $in: ids } },
          { availabilityStatus: "In Stock", updatedBy: res.locals.user._id }
        );

        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm `
        );
        break;
      case "Low Stock":
        await Product.updateMany(
          { _id: { $in: ids } },
          { availabilityStatus: "Low Stock", updatedBy: res.locals.user._id }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm `
        );
        break;
      case "delete":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedAt: new Date(),
            deletedBy: res.locals.user._id,
          }
        );
        req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm `);
        break;
      case "Change position":
        for (const item of ids) {
          let [id, position] = item.split("-");
          position = parseInt(position);
          await Product.updateOne({ _id: id }, { position: position });
        }
        req.flash(
          "success",
          `Đã cập nhật ví trí thành công ${ids.lenght} sản phẩm `
        );
        break;

      default:
        break;
    }

    //back lai trang truoc
    const backURL = req.get("Referrer") || "/products";
    res.redirect(backURL);
  } catch (err) {
    console.log(err);
    res.send("Error updating");
  }
};

//[DELETE] /admin/products/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;

  await Product.updateOne(
    { _id: id },
    { deleted: true, deletedAt: new Date(), updatedBy: res.locals.user._id }
  );
  req.flash("success", `Đã xóa thành công`);
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};

//[GET] /admin/products/create
module.exports.create = async (req, res) => {
  const categories = await productCategory.find({ deleted: false });
  const treeCategory = createTree(categories);

  res.render("admin/pages/products/create", {
    titlePage: "thêm mới sản phẩm",
    listCategory: treeCategory,
  });
};
//[POST] /admin/products/create
module.exports.createProduct = async (req, res) => {
  req.body.price = parseFloat(req.body.price);
  req.body.discountPercentage = parseFloat(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (req.body.position === "") {
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else req.body.position = parseInt(req.body.position);

  req.body.createdBy = res.locals.user._id;

  // them vao database
  const addProduct = new Product(req.body);
  await addProduct.save();

  req.flash("success", `Đã thêm sản phẩm thành công`);

  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

//[GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ _id: id });
    const categories = await productCategory.find({ deleted: false });
    const treeCategory = createTree(categories);
    res.render("admin/pages/products/edit", {
      titlePage: "chỉnh sửa sản phẩm",
      product: product,
      listCategory: treeCategory,
    });
  } catch (error) {
    req.flash("error", `sản phẩm không tồn tại`);
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

// [PATCH] /admin/products/edit/:id
module.exports.editProduct = async (req, res) => {
  const id = req.params.id;

  req.body.price = parseFloat(req.body.price);
  req.body.discountPercentage = parseFloat(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (req.body.position === "") {
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  req.body.updatedBy = res.locals.user._id;

  // UPDATE chứ KHÔNG phải tạo mới
  await Product.updateOne({ _id: id }, req.body);

  req.flash("success", `Đã chỉnh sửa sản phẩm thành công`);
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};

//[GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
  const id = req.params.id;
  const product = await Product.findOne({ _id: id });

  if (product.updatedBy) {
    const user = await Acccount.findOne({ _id: product.updatedBy }).select(
      "fullName"
    );
    product.updatedByFullName = user.fullName;
  }
  if (product.createdBy) {
    const user = await Acccount.findOne({ _id: product.createdBy }).select(
      "fullName"
    );
    product.createdByFullName = user.fullName;
  }

  res.render("admin/pages/products/detail", {
    titlePage: "chi tiết sản phẩm",
    product: product,
  });
};

// module.exports.test = async (req, res) => {
//   const products = await Product.find({});

//   for (const e of products) {
//     await Product.updateOne({ _id: e._id }, { title: e.title });
//   }

//   res.send("Done");
// };
