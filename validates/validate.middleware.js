const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      req.flash("error", errorMessage);
      return res.redirect("back");
    }
    next();
  };
};

module.exports = validate;
