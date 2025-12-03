const Product = require("../../model/product.model");

const paginationHelper = require("../../helper/pagination");
const systemConfig = require("../../config/system");
//[GET] /admin/products
module.exports.index = async (req, res) => {
  const find = { deleted: false };

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

  const products = await Product.find(find)
    .sort({ position: "desc" })
    .limit(objectPagination.limitPage)
    .skip(objectPagination.skipPage);

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

  await Product.updateOne({ _id: id }, { availabilityStatus: status });

  req.flash("success", "Cập nhật trạng thái thành công");
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
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
          { availabilityStatus: "In Stock" }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm `
        );
        break;
      case "Low Stock":
        await Product.updateMany(
          { _id: { $in: ids } },
          { availabilityStatus: "Low Stock" }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm `
        );
        break;
      case "delete":
        await Product.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date() }
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
  // console.log(id);

  await Product.updateOne(
    { _id: id },
    { deleted: true, deletedAt: new Date() }
  );
  req.flash("success", `Đã xóa thành công`);
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};

//[GET] /admin/products/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/products/create", {
    titlePage: "thêm mới sản phẩm",
  });
};
//[POST] /admin/products/create
module.exports.createProduct = async (req, res) => {
  console.log(req.body);

  req.body.price = parseFloat(req.body.price);
  req.body.discountPercentage = parseFloat(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (req.body.position === "") {
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else req.body.position = parseInt(req.body.position);

  req.body.thumbnail = `/uploads/${req.file.filename}`;
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

    res.render("admin/pages/products/edit", {
      titlePage: "chỉnh sửa sản phẩm",
      product: product,
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

  // Nếu có file mới thì update thumbnail
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }

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
