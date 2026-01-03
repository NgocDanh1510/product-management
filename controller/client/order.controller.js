const Product = require("../../model/product.model");
const Order = require("../../model/order.model");

//[GET] /order/detail/:orderId
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
