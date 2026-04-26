const ProductCategory = require("../../model/product-category.model");
const createTree = require("../../helper/createTreeCategory.helper");

let cachedTreeCategory = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

module.exports = async (req, res, next) => {
  const now = Date.now();
  if (!cachedTreeCategory || now - lastFetchTime > CACHE_TTL) {
    const categories = await ProductCategory.find({ deleted: false })
      .select("_id title parent_id slug")
      .lean();
    cachedTreeCategory = createTree(categories);
    lastFetchTime = now;
  }

  res.locals.treeCategory = cachedTreeCategory;
  next();
};
