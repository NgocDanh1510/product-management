const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      req.flash("error", errorMessage);
      const backURL = req.get("Referrer");
      return res.redirect(backURL);
    }
    next();
  };
};

module.exports = validate;
