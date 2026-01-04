const Setting = require("../../model/setting.model");
const systemConfig = require("../../config/system");
//[GET] /admin/dashboard
module.exports.general = async (req, res) => {
  try {
    // Lấy settings hiện tại (thường chỉ có 1 document)
    let settings = await Setting.findOne();

    // Nếu chưa có settings, tạo mới với giá trị mặc định
    if (!settings) {
      settings = new Setting({
        general: {
          site_title: "Mega Mart",
          site_description: "Siêu thị trực tuyến hàng đầu Việt Nam",
          logo_url:
            "https://res.cloudinary.com/dygsbwyjo/image/upload/v1765963478/Gemini_Generated_Image_po5ntrpo5ntrpo5n_k01pti.png",
          favicon_url:
            "https://res.cloudinary.com/dygsbwyjo/image/upload/v1765963746/favicon_nvffd5.png",
          copyright: "© 2026 Mega Mart. All Rights Reserved.",
        },
        contact: {
          email: "danhngoc927@gmail.com",
          phone: "1900 1234",
          address: "Xã vĩnh lộc a, Bình Chánh, TP.HCM",
        },
        advanced: {
          maintenance_mode: false,
          currency: "$",
          shipping_fee_default: 30000,
        },
      });
      await settings.save();
    }

    res.render("admin/pages/settings/general", {
      titlePage: "Cài đặt hệ thống",
      settings: settings,
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    req.flash("error", "Không thể tải cài đặt!");
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
  }
};

module.exports.generalPatch = async (req, res) => {
  // Lấy record đầu tiên để update
  const setting = await Setting.findOne({});

  if (req.body.favicon) {
    req.body.general.favicon_url = req.body.favicon;
    delete req.body.favicon;
  }
  if (req.body.logo) {
    req.body.general.logo_url = req.body.logo;
    delete req.body.logo;
  }
  console.log(req.body);
  if (setting) {
    // Cập nhật record đã tồn tại
    await Setting.updateOne({ _id: setting.id }, req.body);
  } else {
    // Tạo mới nếu chưa có (trường hợp hiếm)
    await Setting.create(req.body);
  }
  console.log(req.body);

  req.flash("success", "Cập nhật cấu hình thành công!");
  res.redirect(`${systemConfig.prefixAdmin}/settings`);
};
