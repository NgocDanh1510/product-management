const dashboardRoute = require("./dashboard.route");
const productRoute = require("./product.route");
const productCategoryRoute = require("./product-category.route");
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
  app.use(
    PATH_ADMIN + "/dashboard",
    middlewareAuthen.requestAuth,
    dashboardRoute
  );
  app.use(PATH_ADMIN + "/products", middlewareAuthen.requestAuth, productRoute);
  app.use(
    PATH_ADMIN + "/product-category",
    middlewareAuthen.requestAuth,
    productCategoryRoute
  );
  app.use(PATH_ADMIN + "/roles", middlewareAuthen.requestAuth, roleRoute);
  app.use(PATH_ADMIN + "/accounts", middlewareAuthen.requestAuth, accountRoute);
  app.use(PATH_ADMIN + "/auth", loginRoute);
};
