const Joi = require("joi");

const orderSchema = Joi.object({
  userInfor: Joi.object().required().messages({
    "any.required": "Thông tin người dùng là bắt buộc",
    "object.base": "Thông tin người dùng không hợp lệ"
  }),
  products: Joi.array().min(1).required().messages({
    "array.min": "Giỏ hàng phải có ít nhất 1 sản phẩm",
    "any.required": "Danh sách sản phẩm là bắt buộc"
  })
});

module.exports = orderSchema;
