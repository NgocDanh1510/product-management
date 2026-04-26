const Setting = require("../../model/setting.model");

let cachedSetting = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

module.exports = async (req, res, next) => {
  const now = Date.now();
  if (!cachedSetting || now - lastFetchTime > CACHE_TTL) {
    cachedSetting = await Setting.findOne({}).select(
      "general contact social_media"
    ).lean();
    lastFetchTime = now;
  }
  
  res.locals.settingGeneral = cachedSetting;
  next();
};
