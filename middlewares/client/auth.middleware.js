const User = require("../../model/user.model");
const Cart = require("../../model/cart.model");

module.exports.checkLogin = async (req, res, next) => {
  const token = req.cookies.tokenUser;

  if (token) {
    const user = await User.findOne({ tokenUser: token }).select(
      "-password -tokenUser -status"
    );

    if (user) {
      res.locals.user = user;

      //check cart
      const cartUser = await Cart.findOne({ user_id: user.id });
      const cartId = req.cookies.cartId;
      if (cartUser) {
        if (cartUser.id != cartId) {
          // phần xử lý trộn giỏ hàng

          //gán lại giỏ hàng
          await Cart.deleteOne({ _id: cartId });
          req.cookies.cartId = cartUser.id;
          res.cookie("cartId", cartUser.id, {
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          });
        }
      } else {
        await Cart.updateOne(
          { _id: cartId },
          { user_id: user.id, expiresAt: null }
        );
      }
    }
  }
  next();
};
