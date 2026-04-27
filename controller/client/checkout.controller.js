const Cart = require("../../model/cart.model");
const Product = require("../../model/product.model");
const Order = require("../../model/order.model");
const cartHelper = require("../../helper/cart.helper");

// [GET] /checkout
module.exports.index = async (req, res) => {
  try {
    const cart = await cartHelper.getCartWithProducts(req.cookies.cartId);

    // Render view
    res.render("client/pages/checkout/index", {
      titlePage: "Giỏ hàng",
      cart: cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

//[POST] /checkout/order
module.exports.order = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const cart = await cartHelper.getCartWithProducts(cartId);

    // Nếu user chưa có địa chỉ hoặc số điện thoại → cập nhật từ form đặt hàng
    if (!res.locals.user.address || !res.locals.user.phone) {
      await res.locals.user.updateOne({
        address: req.body.address,
        phone: req.body.phone,
      });
    }

    const order = {
      user_id: res.locals.user.id,
      note: req.body.note,
      paymentMethod: req.body.paymentMethod,
      totalPrice: cart.totalPriceNew,
      totalOriginalPrice: cart.totalPrice,
    };
    delete req.body.note;
    delete req.body.paymentMethod;

    order.userInfor = req.body;

    const productNew = cart.products.map((item) => {
      return {
        product_id: item.product_id,
        price: item.detail.price,
        title: item.detail.title,
        thumbnail: item.detail.thumbnail,
        discountPercentage: item.detail.discountPercentage,
        quantity: item.quantity,
      };
    });
    
    order.products = productNew;

    const orderNew = new Order(order);
    await orderNew.save();
    // xóa sản phẩm trong giỏ hàng

    await Cart.updateOne({ _id: cartId }, { products: [] });
    //chuyển trang thanh toán ( nếu thanh toán ngân hàng, ví mono)

    // chuyển đến trang đặt hàng thành công
    res.redirect(`/checkout/success/${orderNew._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

//[GET] /checkout/success/:oderId
module.exports.success = async (req, res) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId)
    .select("userInfor totalPrice paymentMethod")
    .lean();
  // đầu ra cần truyền
  // {
  //   orderId: "ORD123",
  //   order: { fullName, phone, address, paymentMethod, totalPrice }
  // }
  const orderFormat = {
    ...order.userInfor,
    totalPrice: order.totalPrice,
    paymentMethod: order.paymentMethod,
  };

  res.render("client/pages/checkout/success", {
    titlePage: "Thanh toán thành công",
    orderId: orderId,
    order: orderFormat,
  });
};
