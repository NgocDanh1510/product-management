const Account = require("../../model/account.model");
const systemConfig = require("../../config/system");
const Role = require("../../model/role.model");
const bcrypt = require("bcrypt");

//[GET] /admin/accounts
module.exports.index = async (req, res) => {
  let find = { deleted: false };
  const accounts = await Account.find(find)
    .populate({ path: "role_id", match: { deleted: false }, select: "title" })
    .select("-password -token").lean();

  for (const element of accounts) {
    if (element.role_id) {
      element.nameRole = element.role_id.title;
    }
  }

  res.render("admin/pages/accounts/index", {
    titlePage: "tai khoan",
    listAccount: accounts,
  });
};

//[GET] /admin/create
module.exports.create = async (req, res) => {
  const roles = await Role.find({ deleted: false }).lean();
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
    }).lean();

    if (isExist) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect(`${systemConfig.prefixAdmin}/accounts/create`);
    }
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const accountData = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      avatar: req.body.avatar,
      password: req.body.password,
      role_id: req.body.role_id,
      status: req.body.status,
    };
    const newAccount = new Account(accountData);
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
  const account = await Account.findOne({ _id: req.params.id }).lean();
  const roles = await Role.find({ deleted: false }).lean();

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
    }).lean();

    if (isExist) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect(req.get("Referrer"));
    }

    const updateData = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      avatar: req.body.avatar,
      role_id: req.body.role_id,
      status: req.body.status,
    };

    // Xử lý password
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    await Account.updateOne({ _id: id }, { $set: updateData });

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
