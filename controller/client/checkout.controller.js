const Cart = require("../../model/cart.model");
const Product = require("../../model/product.model");
const Order = require("../../model/order.model");
const cartHelper = require("../../helper/cart.helper");
const sendMail = require("../../helper/sendMail");

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

    // Kiểm tra tồn kho trước khi tạo order
    for (const item of cart.products) {
      if (item.detail.stock < item.quantity) {
        req.flash(
          "error",
          `Sản phẩm "${item.detail.title}" chỉ còn ${item.detail.stock} sản phẩm trong kho!`
        );
        return res.redirect("back");
      }
    }

    // Nếu user chưa có địa chỉ hoặc số điện thoại → cập nhật từ form đặt hàng
    if (!res.locals.user.address || !res.locals.user.phone) {
      await res.locals.user.updateOne({
        address: req.body.address,
        phone: req.body.phone,
      });
    }

    const order = {
      user_id: res.locals.user._id,
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

    // Trừ stock sau khi order thành công
    for (const item of cart.products) {
      await Product.updateOne(
        { _id: item.product_id },
        { $inc: { stock: -item.quantity } }
      );
    }

    // xóa sản phẩm trong giỏ hàng
    await Cart.updateOne({ _id: cartId }, { products: [] });

    // Gửi email xác nhận đơn hàng
    if (orderNew.userInfor.email) {
      let productsHtml = "";
      for (const item of orderNew.products) {
        productsHtml += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.title}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.price}</td>
          </tr>
        `;
      }

      const htmlTemplate = `
        <h3>Xin chào ${orderNew.userInfor.fullName},</h3>
        <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Dưới đây là thông tin đơn hàng của bạn:</p>
        <ul>
          <li><strong>Mã đơn hàng:</strong> ${orderNew._id}</li>
          <li><strong>Ngày đặt:</strong> ${new Date().toLocaleString("vi-VN")}</li>
          <li><strong>Trạng thái:</strong> Chờ xác nhận</li>
          <li><strong>Phương thức thanh toán:</strong> ${orderNew.paymentMethod}</li>
        </ul>
        <h4>Thông tin giao hàng:</h4>
        <ul>
          <li><strong>Họ tên:</strong> ${orderNew.userInfor.fullName}</li>
          <li><strong>Số điện thoại:</strong> ${orderNew.userInfor.phone}</li>
          <li><strong>Địa chỉ:</strong> ${orderNew.userInfor.address}</li>
        </ul>
        <h4>Chi tiết sản phẩm:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tên sản phẩm</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Số lượng</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${productsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Tổng tiền:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>$${orderNew.totalPrice}</strong></td>
            </tr>
          </tfoot>
        </table>
        <p>Chúng tôi sẽ sớm liên hệ với bạn để xác nhận đơn hàng. Chúc bạn một ngày vui vẻ!</p>
      `;

      sendMail(orderNew.userInfor.email, "Xác nhận đặt hàng thành công", htmlTemplate);
    }

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
