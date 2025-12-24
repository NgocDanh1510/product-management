const dashboardRoute = require("./dashboard.route");
const productRoute = require("./product.route");
const productCategoryRoute = require("./product-category.route");
const postRoute = require("./post.route");
const postCategoryRoute = require("./post-category.route");
const roleRoute = require("./role.route");
const accountRoute = require("./account.route");
const loginRoute = require("./auth.route");

//system
const systemConfig = require("../../config/system");

//middlewares
const middlewareAuthen = require("../../middlewares/admin/auth.middleware");

module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  //chuyen huong /admin sang /admin/dashboard
  app.get(PATH_ADMIN, (req, res) => {
    res.redirect(`${PATH_ADMIN}/dashboard`);
  });

  app.use(PATH_ADMIN + "/auth", loginRoute);

  app.use(PATH_ADMIN, middlewareAuthen.requestAuth);

  app.use(PATH_ADMIN + "/dashboard", dashboardRoute);
  app.use(PATH_ADMIN + "/products", productRoute);
  app.use(PATH_ADMIN + "/product-category", productCategoryRoute);
  app.use(PATH_ADMIN + "/posts", postRoute);
  app.use(PATH_ADMIN + "/post-category", postCategoryRoute);
  app.use(PATH_ADMIN + "/roles", roleRoute);
  app.use(PATH_ADMIN + "/accounts", accountRoute);
};
