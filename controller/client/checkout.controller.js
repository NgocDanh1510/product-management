const Cart = require("../../model/cart.model");
const Product = require("../../model/product.model");
const Order = require("../../model/order.model");

// [GET] /checkout
module.exports.index = async (req, res) => {
  try {
    const cart = await Cart.findOne({ _id: req.cookies.cartId }).lean();

    // Khởi tạo tổng tiền
    let totalPrice = 0;
    let totalPriceNew = 0;

    // Nếu cart trống
    if (!cart || cart.products.length === 0) {
      cart.products = [];
      cart.totalPrice = 0;
      cart.totalPriceNew = 0;
      cart.totalDiscount = 0;
    }

    // Lấy danh sách product_id
    const productIds = cart.products.map((item) => item.product_id);

    // Lấy toàn bộ product trong 1 query
    const products = await Product.find({
      _id: { $in: productIds },
    })
      .select("title thumbnail price discountPercentage")
      .lean();

    // Map product theo id
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // Build lại cart.products để render
    const cartProducts = cart.products
      .map((item) => {
        const product = productMap[item.product_id.toString()];

        if (!product) return null; // sản phẩm đã bị xóa

        const priceNew = Number(
          (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
        );

        const itemTotalPrice = product.price * item.quantity;
        const itemTotalPriceNew = Number((priceNew * item.quantity).toFixed(2));

        totalPrice += itemTotalPrice;
        totalPriceNew += itemTotalPriceNew;

        return {
          // product_id: product._id,
          title: product.title,
          thumbnail: product.thumbnail,
          quantity: item.quantity,
          totalPrice: itemTotalPriceNew,
        };
      })
      .filter(Boolean); // loại bỏ product null

    // Gán lại dữ liệu cho cart
    cart.products = cartProducts;
    cart.totalPrice = totalPrice;
    cart.totalPriceNew = Number(totalPriceNew.toFixed(2));
    cart.totalDiscount = Number((totalPrice - totalPriceNew).toFixed(2));

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
    const cart = await Cart.findById(cartId).lean();

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
      totalPrice: 0,
      totalOriginalPrice: 0,
    };
    delete req.body.note;
    delete req.body.paymentMethod;

    order.userInfor = req.body;

    const product_ids = cart.products.map((item) => item.product_id);

    const productMap = {};
    const products = await Product.find({ _id: { $in: product_ids } })
      .select("_id title thumbnail price discountPercentage")
      .lean();

    products.forEach((item) => {
      productMap[item._id.toString()] = item;
    });

    const productNew = cart.products.map((item) => {
      const product = productMap[item.product_id.toString()];
      const priceNew =
        Math.round(
          product.price * (1 - product.discountPercentage / 100) * 100
        ) / 100;

      order.totalOriginalPrice += product.price * item.quantity;
      order.totalPrice += priceNew * item.quantity;
      return {
        product_id: product._id,
        price: product.price,
        title: product.title,
        thumbnail: product.thumbnail,
        discountPercentage: product.discountPercentage,
        quantity: item.quantity,
      };
    });
    order.totalOriginalPrice = Number(order.totalOriginalPrice.toFixed(2));
    order.totalPrice = Number(order.totalPrice.toFixed(2));
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
