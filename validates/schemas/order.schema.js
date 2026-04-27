const Joi = require("joi");

const orderSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Tên không được để trống",
    "string.min": "Tên phải ít nhất 3 ký tự",
  }),

  phone: Joi.string()
    .pattern(/^(0|\+84)[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Số điện thoại không hợp lệ",
    }),

  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
  }),

  address: Joi.string().min(5).required().messages({
    "string.empty": "Địa chỉ không được để trống",
  }),

  note: Joi.string()
    .allow("") // cho phép rỗng
    .optional(),

  paymentMethod: Joi.string().valid("cod", "bank", "momo").required().messages({
    "any.only": "Phương thức thanh toán không hợp lệ",
  }),
});

module.exports = orderSchema;
