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

  // Whitelist các fields được phép cập nhật
  const updateData = {};

  if (req.body.general) {
    updateData.general = {
      site_title: req.body.general.site_title,
      site_description: req.body.general.site_description,
      logo_url: req.body.logo || req.body.general.logo_url,
      favicon_url: req.body.favicon || req.body.general.favicon_url,
      copyright: req.body.general.copyright,
    };
  }

  if (req.body.contact) {
    updateData.contact = {
      email: req.body.contact.email,
      phone: req.body.contact.phone,
      address: req.body.contact.address,
      map_iframe: req.body.contact.map_iframe,
    };
  }

  if (req.body.social_media) {
    updateData.social_media = {
      facebook: req.body.social_media.facebook,
      twitter: req.body.social_media.twitter,
      instagram: req.body.social_media.instagram,
      youtube: req.body.social_media.youtube,
      linkedin: req.body.social_media.linkedin,
    };
  }

  if (req.body.advanced) {
    updateData.advanced = {
      maintenance_mode: req.body.advanced.maintenance_mode === "true" || req.body.advanced.maintenance_mode === true,
      currency: req.body.advanced.currency,
      shipping_fee_default: Number(req.body.advanced.shipping_fee_default),
    };
  }

  if (setting) {
    await Setting.updateOne({ _id: setting.id }, updateData);
  } else {
    await Setting.create(updateData);
  }

  req.flash("success", "Cập nhật cấu hình thành công!");
  res.redirect(`${systemConfig.prefixAdmin}/settings`);
};
