const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

/**
 * Tạo JWT token
 * @param {Object} payload - Dữ liệu cần mã hóa (vd: { _id, role_id })
 * @returns {String} JWT token
 */
module.exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

/**
 * Xác thực JWT token
 * @param {String} token - JWT token cần verify
 * @returns {Object|null} Decoded payload nếu hợp lệ, null nếu không
 */
module.exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
