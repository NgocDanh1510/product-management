const Role = require("../../model/role.model");
const systemConfig = require("../../config/system");

//[GET] /admin/roles
module.exports.index = async (req, res) => {
  let find = { deleted: false };
  const roles = await Role.find(find);
  res.render("admin/pages/roles/index", {
    titlePage: "vai trò",
    listRole: roles,
  });
};

//[GET] /admin/roles/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    titlePage: "thêm vai trò",
  });
};

//[POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
  const newRole = new Role(req.body);
  await newRole.save();
  res.redirect(`${systemConfig.prefixAdmin}/roles`);
};

//[GET] /admin/roles/permission
module.exports.permission = async (req, res) => {
  let find = { deleted: false };
  const roles = await Role.find(find);

  res.render("admin/pages/roles/permission", {
    titlePage: "Phân quyền",
    records: roles,
  });
};

//[PATCH] /admin/roles/permission
module.exports.permissionPatch = async (req, res) => {
  const permission = JSON.parse(req.body.permission);
  permission.forEach(async (item) => {
    await Role.updateOne({ _id: item._id }, { permissions: item.permissions });
  });
  res.redirect(`${systemConfig.prefixAdmin}/roles/permission`);
};

//[GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
  const role = await Role.findOne({ _id: req.params.id });

  res.render("admin/pages/roles/edit", {
    titlePage: "chỉnh sửa",
    role: role,
  });
};

//[PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;
  const dataUpdate = req.body;
  await Role.updateOne({ _id: id }, dataUpdate);

  req.flash("success", `Đã chỉnh sửa vai trò thành công`);
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};

//[GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
  const role = await Role.findOne({ _id: req.params.id });

  res.render("admin/pages/roles/detail", {
    titlePage: "chi tiết",
    role: role,
  });
};

//[DELETE] /admin/roles/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;
  await Role.updateOne({ _id: id }, { deleted: true });

  req.flash("success", `Đã chỉnh sửa vai trò thành công`);
  //back lai trang truoc
  const backURL = req.get("Referrer") || "/products";
  res.redirect(backURL);
};
