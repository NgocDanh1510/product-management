const Setting = require("../../model/setting.model");

module.exports = async (req, res, next) => {
  const settingGeneral = await Setting.findOne({}).select(
    "general contact social_media"
  );
  res.locals.settingGeneral = settingGeneral;
  next();
};
