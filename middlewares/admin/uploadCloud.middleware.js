const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
//cloudinary
cloudinary.config({
  cloud_name: "dygsbwyjo",
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const streamUpload = (file) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

module.exports.upload = async (req, res, next) => {
  log;
  if (req.file) {
    let result = await streamUpload(req.file);
    req.body[req.file.fieldname] = result.secure_url;
  }

  next();
};
module.exports.uploadFields = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next();
  }
  for (const key in req.files) {
    const element = req.files[key];

    let result = await streamUpload(element[0]);
    req.body[element[0].fieldname] = result.secure_url;
  }

  next();
};
