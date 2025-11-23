const mongoose = require("mongoose");

module.exports.connect = async () => {
  try {
    mongoose.connect(process.env.URL_DB);
    console.log("connect success");
  } catch (error) {
    console.log("connect fail");
  }
};
