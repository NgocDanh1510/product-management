const User = require("../../model/user.model");

module.exports.checkLogin = async (req, res, next) => {
  const token = req.cookies.tokenUser;

  if (token) {
    const user = await User.findOne({ tokenUser: token }).select(
      "-password -tokenUser -status"
    );
    if (user) {
      res.locals.user = user;
    }
  }
  next();
};
