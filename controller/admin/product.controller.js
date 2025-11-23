const Product = require("../../model/product.model");

//[GET] /admin/products
module.exports.index = async (req, res) => {
  const find = {};

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
  const countProduct = await Product.countDocuments(find);

  const objectPagination = {
    currentPage: 1,
    limtPage: 4,
    pageTotal: Math.ceil(countProduct / 4),
  };

  if (req.query.page) {
    objectPagination.currentPage = parseInt(req.query.page);
    objectPagination.skipPage =
      (objectPagination.currentPage - 1) * objectPagination.limtPage;
  }

  const products = await Product.find(find)
    .limit(objectPagination.limtPage)
    .skip(objectPagination.skipPage);
  res.render("admin/pages/products/index", {
    titlePage: "ProductAdmin",
    listProduct: products,
    status: availabilityStatus,
    keyword: keyword,
    pagination: objectPagination,
  });
};
