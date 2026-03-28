//[GET] /admin/dashboard
const Order = require("../../model/order.model");
const Product = require("../../model/product.model");
const User = require("../../model/user.model");
const Account = require("../../model/account.model");

module.exports.index = async (req, res) => {
  try {
    // Lấy thống kê cơ bản
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments({ deleted: false });
    const totalUsers = await User.countDocuments();
    const totalAccounts = await Account.countDocuments({ deleted: false });

    // Lấy doanh thu từ các đơn hàng
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          averageOrderValue: { $avg: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const averageOrderValue = revenueData[0]?.averageOrderValue || 0;

    // Lấy đơn hàng mới nhất
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("userInfor totalPrice status createdAt");

    // Thống kê trạng thái đơn hàng
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.render("admin/pages/dashboard/index", {
      titlePage: "Dashboard",
      stats: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalAccounts,
        totalRevenue: totalRevenue.toLocaleString("vi-VN"),
        averageOrderValue: averageOrderValue.toLocaleString("vi-VN", {
          maximumFractionDigits: 2,
        }),
      },
      recentOrders,
      orderStatusStats,
    });
  } catch (error) {
    console.log(error);
    res.render("admin/pages/dashboard/index", {
      titlePage: "Dashboard",
      stats: {
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalAccounts: 0,
        totalRevenue: "0",
        averageOrderValue: "0",
      },
      recentOrders: [],
      orderStatusStats: [],
    });
  }
};
