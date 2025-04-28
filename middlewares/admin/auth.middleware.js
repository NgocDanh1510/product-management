const Account = require("../../model/account.model");
const Role = require("../../model/role.model");
const systemConfig = require("../../config/system");
const jwtHelper = require("../../helper/jwt.helper");

module.exports.requestAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    const decoded = jwtHelper.verifyToken(token);
    if (decoded) {
      const user = await Account.findOne({
        _id: decoded._id,
        deleted: false,
      }).select("-password").lean();
      if (user) {
        const role = await Role.findOne({ _id: user.role_id }).lean();
        res.locals.user = user;
        res.locals.role = role;
        return next();
      }
    }
  }
  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
};
