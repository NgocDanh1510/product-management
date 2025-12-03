const Product = require("../../model/product.model");

//[GET] /products
module.exports.index = async (req, res) => {
  const products = await Product.find({
    availabilityStatus: "In Stock",
    deleted: false,
  }).sort({ position: "desc" });

  const newProducts = products.map((item) => {
    item.newPrice = (item.price * (1 - item.discountPercentage / 100)).toFixed(
      2
    );
    return item;
  });
  res.render("client/pages/products/index", {
    titlePage: "product",
    listProduct: newProducts,
  });
};
//[GET] /products/:slug
module.exports.detail = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    });
    product.newPrice = (
      product.price *
      (1 - product.discountPercentage / 100)
    ).toFixed(2);
    res.render("client/pages/products/detail", {
      titlePage: product.title,
      product: product,
    });
  } catch (error) {
    res.send("404");
  }
};
