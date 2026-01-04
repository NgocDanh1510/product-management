const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    general: {
      site_title: {
        type: String,
        default: "My Admin Site",
        trim: true,
      },
      site_description: {
        type: String,
        default: "Welcome to our e-commerce platform",
      },
      logo_url: {
        type: String, // Đường dẫn ảnh logo
        default: "/images/logo-default.png",
      },
      favicon_url: {
        type: String,
        default: "/images/favicon.ico",
      },
      copyright: {
        type: String,
        default: "© 2026 All Rights Reserved.",
      },
    },

    // 2. Thông tin liên hệ (Hiển thị ở footer hoặc trang Contact)
    contact: {
      email: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
      },
      map_iframe: {
        type: String, // Mã nhúng Google Map
      },
    },

    // 3. Mạng xã hội (Lưu link)
    social_media: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
      linkedin: String,
    },

    // 4. Cấu hình gửi mail (SMTP) - Nếu bạn muốn admin tự chỉnh mail server
    mail_config: {
      email_from: String,
      host: String,
      port: Number,
      username: String,
      password: String, // Lưu ý: Nên mã hóa field này nếu cần bảo mật cao
      secure: {
        type: Boolean,
        default: false,
      },
    },

    // 5. Cài đặt nâng cao (Bảo trì, số lượng hiển thị, v.v.)
    advanced: {
      maintenance_mode: {
        type: Boolean,
        default: false, // Nếu true -> chặn user truy cập frontend
      },
      currency: {
        type: String,
        default: "VND",
      },
      shipping_fee_default: {
        type: Number,
        default: 30000,
      },
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Pattern Singleton: Đảm bảo logic code chỉ cho phép 1 record tồn tại (xử lý ở Controller)
const Setting = mongoose.model("Setting", settingSchema, "settings");

module.exports = Setting;
