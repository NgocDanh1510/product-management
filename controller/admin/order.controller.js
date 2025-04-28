const Order = require("../../model/order.model");
const paginationHelper = require("../../helper/pagination");
const mongoose = require("mongoose");
//[GET] /admin/order
module.exports.index = async (req, res) => {
  const filters = {};
  const sort = { createdAt: "desc" };
  //?status
  if (req.query.status) {
    filters.status = req.query.status;
  }

  //?search
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regex = new RegExp(keyword, "i");

    filters.$or = [{ "userInfor.fullName": regex }];

    if (mongoose.Types.ObjectId.isValid(keyword)) {
      filters.$or.push({ _id: keyword });
    }
  }
  const status = {
    pending: {
      label: "Chờ xác nhận",
      buttonColor: "bg-secondary",
      icon: "bi bi-hourglass-split",
    },
    confirmed: {
      label: "Đã xác nhận",
      buttonColor: "bg-primary",
      icon: "bi bi-check-circle",
    },
    shipping: {
      label: "Đang giao",
      buttonColor: "bg-warning",
      icon: "bi bi-truck",
    },
    completed: {
      label: "Hoàn thành",
      buttonColor: "bg-success",
      icon: "bi bi-check2-all",
    },
    cancelled: {
      label: "Đã huỷ",
      buttonColor: "bg-danger",
      icon: "bi bi-x-circle",
    },
  };
  //?page=
  const objectPagination = await paginationHelper(
    {
      currentPage: 1,
      limitPage: 5,
    },
    req.query,
    Order,
    filters
  );
  const orders = await Order.find(filters).sort(sort).lean();

  for (const order of orders) {
    order.totalQuantity = order.products.reduce(
      (sum, p) => sum + p.quantity,
      0
    );
  }

  res.render("admin/pages/orders/index", {
    titlePage: "Quản lý đơn hàng",
    listOrder: orders,
    pagination: objectPagination,
    currentStatus: req.query.status,
    status,
  });
};

//[PATCH] /admin/order/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { id, status } = req.params;
  await Order.updateOne({ _id: id }, { status });

  req.flash("success", "Cập nhật trạng thái thành công");
  //back lai trang truoc
  const backURL = req.get("Referrer");
  res.redirect(backURL);
};

//[PATCH] /admin/order/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({
      _id: id,
    }).lean();

    if (!order) {
      req.flash("error", "Không tìm thấy đơn hàng!");
      return res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }

    const getStatusLabel = (status) => {
      const labels = {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        shipping: "Đang giao hàng",
        completed: "Hoàn thành",
        cancelled: "Đã hủy",
      };
      return labels[status] || "Không xác định";
    };

    const getStatusClass = (status) => {
      const classes = {
        pending: "bg-warning",
        confirmed: "bg-info",
        shipping: "bg-primary",
        completed: "bg-success",
        cancelled: "bg-danger",
      };
      return classes[status] || "bg-secondary";
    };

    res.render("admin/pages/orders/detail", {
      titlePage: "Chi tiết đơn hàng",
      order: order,
      getStatusLabel: getStatusLabel, // Truyền hàm sang view
      getStatusClass: getStatusClass, // Truyền hàm sang view
    });
  } catch (error) {
    console.log(error);
    res.redirect(`${systemConfig.prefixAdmin}/orders`);
  }
};
