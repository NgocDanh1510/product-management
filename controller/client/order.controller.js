const Product = require("../../model/product.model");
const Order = require("../../model/order.model");

//[GET] /orders

module.exports.index = async (req, res) => {
  const userId = res.locals.user._id;
  const filter = { user_id: userId };

  const status = req.query.status;
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean(); // Sắp xếp đơn mới nhất lên đầu

  res.render("client/pages/orders/index", {
    titlePage: "Lịch sử đơn hàng",
    orders: orders,
  });
};

//[GET] /orders/detail/:orderId
module.exports.detail = async (req, res) => {
  const order = await Order.findById(req.params.orderId).lean();

  for (const element of order.products) {
    element.priceNew = Number(
      (element.price * (1 - element.discountPercentage / 100)).toFixed(2)
    );

    element.totalPrice = Number(
      (element.priceNew * element.quantity).toFixed(2)
    );
  }
  order.discount = (order.totalOriginalPrice - order.totalPrice).toFixed(2);

  res.render("client/pages/orders/detail", {
    titlePage: "Chi tiết đơn hàng",
    order: order,
  });
};
