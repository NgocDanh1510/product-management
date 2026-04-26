const Joi = require("joi");

const accountSchema = Joi.object({
  email: Joi.string().email().messages({
    "string.empty": "Email không được để trống",
    "string.email": "Email không hợp lệ"
  }),
  password: Joi.string().min(6).allow("").messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự"
  }),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).allow("").messages({
    "string.pattern.base": "Số điện thoại không hợp lệ"
  })
});

module.exports = accountSchema;
