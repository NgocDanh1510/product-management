const Cart = require("../../model/cart.model");
module.exports = async (req, res, next) => {
  const cartId = req.cookies.cartId;
  if (!cartId) {
    const cart = new Cart();
    await cart.save();
    res.cookie("cartId", cart.id, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60),
    });
  } else {
    const cart = await Cart.findById(cartId).lean();

    res.locals.cartTotalProduct = cart.products.length;
  }
  next();
};
