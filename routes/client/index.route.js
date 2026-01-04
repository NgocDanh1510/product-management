const productRoutes = require("./product.route");
const homeRoutes = require("./home.route");
const searchRoutes = require("./search.route");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const orderRoutes = require("./order.route");
const userRoutes = require("./user.route");
const postRoutes = require("./post.route");

//middleware
const treeCategoryMiddleWare = require("../../middlewares/client/getCategories.middleware");
const checkCart = require("../../middlewares/client/cart.middleware");
const auth = require("../../middlewares/client/auth.middleware");
const settingGeneral = require("../../middlewares/client/setting.middleware");

module.exports = (app) => {
  app.use(treeCategoryMiddleWare);
  app.use(settingGeneral);
  app.use(checkCart);
  app.use(auth.checkLogin);
  app.use("/", homeRoutes);
  app.use("/search", searchRoutes);
  app.use("/products", productRoutes);
  app.use("/cart", cartRoutes);
  app.use("/checkout", checkoutRoutes);
  app.use("/order", orderRoutes);
  app.use("/user", userRoutes);
  app.use("/posts", postRoutes);
};
