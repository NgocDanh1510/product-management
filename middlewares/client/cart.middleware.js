const Cart = require("../../model/cart.model");
module.exports = async (req, res, next) => {
  const cartId = req.cookies.cartId;
  if (!cartId) {
    const cart = new Cart({
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await cart.save();
    res.cookie("cartId", cart.id, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
  } else {
    const cart = await Cart.findById(cartId).lean();
    if (!cart) {
      res.clearCookie("cartId");
      return next();
    } else res.locals.cartTotalProduct = cart.products?.length || 0;
  }
  next();
};
