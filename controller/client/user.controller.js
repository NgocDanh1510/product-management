const User = require("../../model/user.model");
const ForgotPassword = require("../../model/forgot-password.model");
const random = require("../../helper/generateRandom");
const sendMail = require("../../helper/sendMail");
const bcrypt = require("bcrypt");
const jwtHelper = require("../../helper/jwt.helper");

// [GET] /user/login
module.exports.login = (req, res) => {
  if (req.cookies.tokenUser) {
    return res.redirect(`/`);
  }
  res.render("client/pages/user/login", { titlePage: "Đăng nhập" });
};
// [GET] /user/logout
module.exports.logout = (req, res) => {
  res.clearCookie("tokenUser");
  res.clearCookie("cartId");

  return res.redirect("/user/login");
};

// [GET] /user/register
module.exports.register = (req, res) => {
  res.render("client/pages/user/register", { titlePage: "Đăng ký" });
};

// [PATCH] /user/login
module.exports.loginPost = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email }).lean();

  if (!user) {
    req.flash("error", "email hoặc mật khẩu không hợp lệ!");
    return res.redirect(req.get("Referrer"));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash("error", "email hoặc mật khẩu không hợp lệ!");
    return res.redirect(req.get("Referrer"));
  }

  const jwtToken = jwtHelper.generateToken({ _id: user._id });
  res.cookie("tokenUser", jwtToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });

  //back trang chu
  res.redirect("/");
};
// [PATCH] /user/register
module.exports.registerPost = async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.body.email }).lean();
    if (emailExist) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect(req.get("Referrer"));
    }

    if (req.body.confirmPassword !== req.body.password) {
      req.flash("error", "Mật khẩu nhập lại không khớp!");
      return res.redirect(req.get("Referrer"));
    }

    req.body.password = await bcrypt.hash(req.body.password, 10);
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
  const emailExist = await User.findOne({ email: email }).lean();

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
  const checkOtp = await ForgotPassword.findOne({ email, otp }).lean();
  if (!checkOtp) {
    req.flash("error", "Mã OTP không đúng, vui lòng nhập lại!");
    return res.redirect(req.get("Referrer"));
  }

  const user = await User.findOne({ email }).select("_id").lean();

  const jwtToken = jwtHelper.generateToken({ _id: user._id });
  res.cookie("tokenUser", jwtToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15 phút cho reset password
  });

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
    { password: await bcrypt.hash(password, 10) },
  );

  req.flash("success", "Đổi mật khẩu thành công");
  res.redirect(req.get("Referrer"));
};

// [GET] /user/info
module.exports.info = async (req, res) => {
  if (!res.locals.user) {
    return res.redirect("/user/login");
  }

  res.render("client/pages/user/info", {
    titlePage: "Thông tin cá nhân",
    user: res.locals.user,
  });
};

// [PATCH] /user/info
module.exports.updateInfo = async (req, res) => {
  try {
    if (!res.locals.user) {
      return res.redirect("/user/login");
    }

    const { fullName, phone, address } = req.body;

    await User.updateOne(
      { _id: res.locals.user._id },
      {
        fullName: fullName || res.locals.user.fullName,
        phone: phone || res.locals.user.phone,
        address: address || res.locals.user.address,
      },
    );

    req.flash("success", "Cập nhật thông tin thành công!");
    res.redirect(req.get("Referrer"));
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
    res.redirect(req.get("Referrer"));
  }
};
