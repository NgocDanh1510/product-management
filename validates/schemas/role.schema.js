const Joi = require("joi");

const roleSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Tiêu đề không được để trống",
    "any.required": "Tiêu đề là bắt buộc"
  })
});

module.exports = roleSchema;
