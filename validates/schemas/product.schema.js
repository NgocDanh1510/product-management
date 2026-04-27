const Joi = require("joi");

const productSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    "string.empty": "Tiêu đề không được để trống",
    "string.min": "Tiêu đề phải có ít nhất 3 ký tự",
    "any.required": "Tiêu đề là bắt buộc"
  }),
  price: Joi.number().min(0).messages({
    "number.min": "Giá phải lớn hơn hoặc bằng 0"
  }),
  discountPercentage: Joi.number().min(0).max(100).messages({
    "number.min": "Phần trăm giảm giá phải từ 0 đến 100",
    "number.max": "Phần trăm giảm giá phải từ 0 đến 100"
  }),
  stock: Joi.number().min(0).messages({
    "number.min": "Số lượng phải lớn hơn hoặc bằng 0"
  })
});

module.exports = productSchema;
