const md5 = require("md5");
const systemConfig = require("../../config/system");
const Account = require("../../model/account.model");

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

  const user = await Account.findOne({ email: email, deleted: false });

  if (!user) {
    req.flash("error", "email không tồn tại !");
    return res.redirect(req.get("Referrer"));
  }

  if (md5(password) != user.password) {
    req.flash("error", "mật khẩu sai!");
    return res.redirect(req.get("Referrer"));
  }

  if (user.status == "inactive") {
    req.flash("error", "tài khoản đã bị khóa!");
    return res.redirect(req.get("Referrer"));
  }
  res.cookie("token", user.token, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });
  res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
};

//[GET] /admin/auth/logout
module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
};
