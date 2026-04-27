const Cart = require("../model/cart.model");
const Product = require("../model/product.model");

module.exports.getCartWithProducts = async (cartId) => {
  const cart = await Cart.findOne({ _id: cartId }).lean();

  let totalPrice = 0;
  let totalPriceNew = 0;

  if (!cart || !cart.products || cart.products.length === 0) {
    return {
      ...cart,
      products: [],
      totalPrice: 0,
      totalPriceNew: 0,
      totalDiscount: 0,
    };
  }

  const productIds = cart.products.map((item) => item.product_id);

  const products = await Product.find({
    _id: { $in: productIds },
  })
    .select("title thumbnail price discountPercentage stock slug")
    .lean();

  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  const cartProducts = cart.products
    .map((item) => {
      const product = productMap[item.product_id.toString()];

      if (!product) return null;

      const priceNew = product.price * (1 - product.discountPercentage / 100);
      const itemTotalPrice = product.price * item.quantity;
      const itemTotalPriceNew = Number((priceNew * item.quantity).toFixed(2));

      totalPrice += itemTotalPrice;
      totalPriceNew += itemTotalPriceNew;

      return {
        product_id: product._id,
        quantity: item.quantity,
        title: product.title,
        thumbnail: product.thumbnail,
        totalPrice: itemTotalPriceNew, // for checkout index
        detail: {
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPercentage: product.discountPercentage,
          priceNew: priceNew.toFixed(2),
          stock: product.stock,
          totalPrice: itemTotalPriceNew,
          slug: product.slug,
        },
      };
    })
    .filter(Boolean);

  cart.products = cartProducts;
  cart.totalPrice = totalPrice;
  cart.totalPriceNew = Number(totalPriceNew.toFixed(2));
  cart.totalDiscount = Number((totalPrice - totalPriceNew).toFixed(2));

  return cart;
};
