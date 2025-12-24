const Account = require("../../model/account.model");
const systemConfig = require("../../config/system");
const Role = require("../../model/role.model");
const md5 = require("md5");

//[GET] /admin/accounts
module.exports.index = async (req, res) => {
  let find = { deleted: false };
  const accounts = await Account.find(find).select("-password -token");

  for (const element of accounts) {
    if (element.role_id) {
      const role = await Role.findOne({ _id: element.role_id, deleted: false });
      element.nameRole = role.title;
    }
  }

  res.render("admin/pages/accounts/index", {
    titlePage: "tai khoan",
    listAccount: accounts,
  });
};

//[GET] /admin/create
module.exports.create = async (req, res) => {
  const roles = await Role.find({ deleted: false });
  res.render("admin/pages/accounts/create", {
    titlePage: "tao tai khoan",
    roles: roles,
  });
};

//[POST] /admin/createPost
module.exports.createPost = async (req, res) => {
  try {
    const isExist = await Account.findOne({
      email: req.body.email,
      deleted: false,
    });

    if (isExist) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
    req.body.password = md5(req.body.password);
    const newAccount = new Account(req.body);
    await newAccount.save();
    req.flash("success", "thêm tài khoản thành công!");
  } catch (error) {
    console.error(error);
    req.flash("error", "thêm tài khoản thất bại!");
  }

  res.redirect(`${systemConfig.prefixAdmin}/accounts`);
};

//[GET] /admin/edit/:id
module.exports.edit = async (req, res) => {
  const account = await Account.findOne({ _id: req.params.id });
  const roles = await Role.find({ deleted: false });

  res.render("admin/pages/accounts/edit", {
    titlePage: "chỉnh sửa tài khoản",
    account: account,
    roles: roles,
  });
};

// [PATCH] /admin/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    const isExist = await Account.findOne({
      _id: { $ne: id },
      email: req.body.email,
      deleted: false,
    });

    if (isExist) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect(req.get("Referrer"));
    }

    // Xử lý password
    if (!req.body.password) {
      delete req.body.password;
    } else {
      req.body.password = md5(req.body.password);
    }

    await Account.updateOne({ _id: id }, { $set: req.body });

    req.flash("success", "Cập nhật tài khoản thành công!");
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật tài khoản thất bại!");
  }

  res.redirect(req.get("Referrer"));
};

//[POST] /admin/delete/:id
module.exports.delete = async (req, res) => {
  try {
    await Account.updateOne({ _id: req.params.id }, { deleted: true });
    req.flash("success", "xóa tài khoản thành công!");
  } catch (error) {
    req.flash("error", "xóa tài khoản thất bại!");
  }

  res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
};
