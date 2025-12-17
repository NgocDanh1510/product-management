const Account = require("../../model/account.model");
const systemConfig = require("../../config/system");

module.exports.requestAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const user = await Account.findOne({ token: token, deleted: false }).select(
      "-password"
    );
    if (user) {
      res.locals.user = user;
      return next();
    }
  }
  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
};
