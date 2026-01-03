const User = require("../../model/user.model");
const ForgotPassword = require("../../model/forgot-password.model");
const random = require("../../helper/generateRandom");
const sendMail = require("../../helper/sendMail");
const md5 = require("md5");

// [GET] /user/login
module.exports.login = (req, res) => {
  res.render("client/pages/user/login", { titlePage: "Đăng nhập" });
};
// [GET] /user/logout
module.exports.logout = (req, res) => {
  res.clearCookie("tokenUser");
  return res.redirect("/user/login");
};

// [GET] /user/register
module.exports.register = (req, res) => {
  res.render("client/pages/user/register", { titlePage: "Đăng ký" });
};

// [PATCH] /user/login
module.exports.loginPost = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    req.flash("error", "email hoặc mật khẩu không hợp lệ!");
    return res.redirect(req.get("Referrer"));
  }

  if (user.password != md5(password)) {
    req.flash("error", "email hoặc mật khẩu không hợp lệ!");
    return res.redirect(req.get("Referrer"));
  }

  res.cookie("tokenUser", user.tokenUser);

  //back trang chu
  res.redirect("/");
};
// [PATCH] /user/register
module.exports.registerPost = async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect(req.get("Referrer"));
    }

    if (req.body.confirmPassword !== req.body.password) {
      req.flash("error", "Mật khẩu nhập lại không khớp!");
      return res.redirect(req.get("Referrer"));
    }

    req.body.password = md5(req.body.password);
    delete req.body.confirmPassword;

    await User.create(req.body);

    req.flash("success", "Đăng ký thành công");
    res.redirect(req.get("Referrer"));
  } catch (err) {
    // Bắt lỗi duplicate key (unique)
    if (err.code === 11000) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect(req.get("Referrer"));
    }
    throw err;
  }
};

// [GET] /user/password/forgot
module.exports.forgot = (req, res) => {
  res.render("client/pages/user/forgot-password", {
    titlePage: "Quên mật khẩu",
  });
};

// [POST] /user/password/forgot
module.exports.forgotPost = async (req, res) => {
  const { email } = req.body;
  const emailExist = await User.findOne({ email: email });

  if (!emailExist) {
    req.flash("error", "Email không tồn tại!");

    return res.redirect(req.get("Referrer"));
  }

  //tạo otp và lưu trong db
  let otp = random.randomNumber(6);
  const record = new ForgotPassword({
    email: email,
    otp: otp,
    expireAt: Date.now(),
  });
  await record.save();

  //gui otp qua email
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h3 style="color: #333;">Mã OTP của bạn</h3>
    <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 10px 0;">
      ${otp}
    </div>
    <p style="font-size: 14px; color: #555;">
      Mã có hiệu lực trong <b>3 phút</b>.
    </p>
    <p style="font-size: 14px; color: red; font-style: italic;">
      *Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
    </p>
  </div>
`;

  sendMail(email, "Mã xác nhận đặt lại mật khẩu", htmlContent);

  res.redirect(`/user/password/otp?email=${email}`);
};

// [GET] /user/password/otp
module.exports.otp = (req, res) => {
  const { email } = req.query;
  res.render("client/pages/user/otp-password", {
    titlePage: "Quên mật khẩu",
    email: email,
  });
};
// [POST] /user/password/otp
module.exports.otpPost = async (req, res) => {
  const { email, otp } = req.body;
  const checkOtp = await ForgotPassword.findOne({ email, otp });
  if (!checkOtp) {
    req.flash("error", "Mã OTP không đúng, vui lòng nhập lại!");
    return res.redirect(req.get("Referrer"));
  }

  const user = await User.findOne({ email }).select("tokenUser");

  res.cookie("tokenUser", user.tokenUser);

  res.redirect(`/user/password/reset`);
};

// [GET] /user/password/reset
module.exports.resetPassword = (req, res) => {
  if (!res.locals.user) {
    return res.send("403");
  }

  res.render("client/pages/user/reset-password", {
    titlePage: "Quên mật khẩu",
  });
};

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const { confirmPassword, password } = req.body;

  if (confirmPassword !== password) {
    req.flash("error", "Mật khẩu nhập lại không khớp!");
    return res.redirect(req.get("Referrer"));
  }

  await User.updateOne(
    { _id: res.locals.user._id },
    { password: md5(password) }
  );

  req.flash("success", "Đổi mật khẩu thành công");
  res.redirect(req.get("Referrer"));
};
