//[GET] /products
const Product = require("../../model/product.model");

module.exports.index = async (req, res) => {
  const products = await Product.find({
    availabilityStatus: "In Stock",
  });

  const newProducts = products.map((item) => {
    item.newPrice = (item.price * (1 - item.discountPercentage / 100)).toFixed(
      2
    );
    return item;
  });
  console.log(newProducts);
  res.render("client/pages/products/index", {
    titlePage: "product",
    listProduct: newProducts,
  });
};
