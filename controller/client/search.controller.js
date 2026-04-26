const Product = require("../../model/product.model");

//[GET] /
module.exports.index = async (req, res) => {
  const { keyword } = req.query;
  let products = [];
  if (keyword) {
    const regexKeyword = new RegExp(keyword, "i");
    products = await Product.find({
      title: regexKeyword,
      deleted: false,
      availabilityStatus: "In Stock",
    }).lean();
  }

  res.render("client/pages/search/index", {
    titlePage: "seach",
    keyword: keyword,
    products: products,
  });
};
