const Joi = require("joi");

const userSchema = Joi.object({
  fullName: Joi.string().required().messages({
    "string.empty": "Họ tên không được để trống",
    "any.required": "Họ tên là bắt buộc"
  }),
  email: Joi.string().email().messages({
    "string.empty": "Email không được để trống",
    "string.email": "Email không hợp lệ"
  }),
  password: Joi.string().min(6).allow("").messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự"
  })
});

module.exports = userSchema;
