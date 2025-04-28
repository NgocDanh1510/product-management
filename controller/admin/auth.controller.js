const bcrypt = require("bcrypt");
const systemConfig = require("../../config/system");
const Account = require("../../model/account.model");
const jwtHelper = require("../../helper/jwt.helper");

//[GET] /admin/auth/login
module.exports.login = (req, res) => {
  if (req.cookies.token) {
    return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
  }

  res.render("admin/pages/auth/login", {
    titlePage: "login Panel",
  });
};

//[POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {
  const { email, password } = req.body;

  const user = await Account.findOne({ email: email, deleted: false }).lean();

  if (!user) {
    req.flash("error", "email không tồn tại !");
    return res.redirect(req.get("Referrer"));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash("error", "mật khẩu sai!");
    return res.redirect(req.get("Referrer"));
  }

  if (user.status == "inactive") {
    req.flash("error", "tài khoản đã bị khóa!");
    return res.redirect(req.get("Referrer"));
  }
  const jwtToken = jwtHelper.generateToken({
    _id: user._id,
    role_id: user.role_id,
  });
  res.cookie("token", jwtToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });
  res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
};

//[GET] /admin/auth/logout
module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
};
