const Cart = require("../../model/cart.model");
const Product = require("../../model/product.model");
const cartHelper = require("../../helper/cart.helper");

// [GET] /cart
module.exports.index = async (req, res) => {
  try {
    const cart = await cartHelper.getCartWithProducts(req.cookies.cartId);

    // Render view
    res.render("client/pages/cart/index", {
      titlePage: "Giỏ hàng",
      cart: cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

//[POST] /cart/add-cart/:productId
module.exports.addCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = Number(req.body.quantity) || 1;
    const cartId = req.cookies.cartId;

    const updated = await Cart.updateOne(
      { _id: cartId, "products.product_id": productId },
      { $inc: { "products.$.quantity": quantity } }
    );

    if (updated.matchedCount === 0) {
      await Cart.updateOne(
        { _id: cartId },
        {
          $push: {
            products: { product_id: productId, quantity },
          },
        }
      );
    }
    req.flash("success", " đã thêm thêm vào giỏ hàng!");

    //back lai trang truoc
    res.redirect(req.get("Referrer"));
  } catch (err) {
    console.error(err);
    req.flash("error", "thêm vào giỏ hàng thất bại");

    //back lai trang truoc
    res.redirect(req.get("Referrer"));
  }
};

//[GET] /cart/delete/:productId
module.exports.delete = async (req, res) => {
  try {
    const productId = req.params.productId;
    const cartId = req.cookies.cartId;

    await Cart.updateOne(
      { _id: cartId },
      {
        $pull: {
          products: { product_id: productId },
        },
      }
    );

    req.flash("success", " đã thêm thêm vào giỏ hàng!");

    //back lai trang truoc
    res.redirect(req.get("Referrer"));
  } catch (err) {
    console.error(err);
    req.flash("error", "thêm vào giỏ hàng thất bại");

    //back lai trang truoc
    res.redirect(req.get("Referrer"));
  }
};

//[GET] /cart/upadte/:productId/:quantity
module.exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.params;

    const cartId = req.cookies.cartId;

    await Cart.updateOne(
      { _id: cartId, "products.product_id": productId },
      {
        $set: {
          "products.$.quantity": quantity,
        },
      }
    );

    res.status(200).end();
  } catch (err) {
    console.error(err);

    res.status(403).end();
  }
};
