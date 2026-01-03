const Product = require("../../model/product.model");
const ProductCategory = require("../../model/product-category.model");
const Post = require("../../model/post.model");

const calculatorHelper = require("../../helper/calculator");
const subCategoriesHelper = require("../../helper/subCategories");
//[GET] /products
module.exports.index = async (req, res) => {
  const { category, minPrice, maxPrice, sortBy } = req.query;

  const sort = { position: "asc" };
  const find = {
    availabilityStatus: "In Stock",
    deleted: false,
  };

  //filter categories
  if (category) {
    const categoryId = await ProductCategory.findOne({ slug: category }).select(
      "_id"
    );
    const subCategories = await subCategoriesHelper(categoryId.id);
    const subCategories_id = subCategories.map((e) => e.id);
    find["product_category_id"] = {
      $in: [categoryId.id, ...subCategories_id],
    };
  }

  //filter price
  if (minPrice && maxPrice) {
    find.price = {
      $gte: Number(minPrice),
      $lte: Number(maxPrice),
    };
  }

  //get max min price
  const priceRange = await Product.aggregate([
    {
      $match: {
        ...find,
      },
    },
    {
      $group: {
        _id: null,
        min: { $min: "$price" },
        max: { $max: "$price" },
      },
    },
  ]);

  const min = priceRange[0]?.min || 0;
  const max = priceRange[0]?.max || 0;

  //sort
  if (sortBy && sortBy != "default") {
    const [type, value] = sortBy.split("-");
    delete sort.position;
    sort[type] = value;
  }
  //get products
  const products = await Product.find(find).sort(sort);

  //get category
  const categories = await ProductCategory.find({
    deleted: false,
    status: "active",
    $or: [{ parent_id: "" }, { parent_id: { $exists: false } }],
  })
    .sort({ position: 1 })
    .limit(8)
    .select("title slug");

  //get post
  const posts = await Post.find({
    deleted: false,
    status: "active",
    isFeatured: true,
  })
    .sort({ position: "desc" })
    .limit(8)
    .select("title description thumbnail slug createdAt");

  const newProducts = calculatorHelper.newPrice(products);
  res.render("client/pages/products/index", {
    pageTitle: "Sản phẩm - Mega Mart",
    listProduct: newProducts, // Danh sách sản phẩm
    categories: categories, // Danh mục cho bộ lọc
    articles: posts, // Tin tức sidebar
    totalProducts: 150, // Tổng số sản phẩm
    selectedCategory: category, // Category đang chọn
    defaultPriceMin: min,
    defaultPriceMax: max,
    filters: {
      minPrice: minPrice,
      maxPrice: maxPrice,
      rating: 4,
    },
    sortBy: sortBy, // Kiểu sắp xếp
    pagination: {
      currentPage: 1,
      totalPages: 13,
      limit: 12,
    },
    queryString: "&category=beauty&sortBy=price-desc",
  });
};

//[GET] /products/:slug
module.exports.detail = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    });

    product.newPrice = (
      product.price *
      (1 - product.discountPercentage / 100)
    ).toFixed(2);

    res.render("client/pages/products/detail", {
      titlePage: product.title,
      product: product,
    });
  } catch (error) {
    res.send("404");
  }
};

//[GET] /products/:slugCategory
module.exports.productCategory = async (req, res) => {
  try {
    const slug = req.params.slugCategory;
    const categoryRoot = await ProductCategory.findOne({ slug: slug }).select(
      "_id"
    );
    const subCategories = await subCategoriesHelper(categoryRoot.id);
    const subCategories_id = subCategories.map((e) => e.id);

    const { category, minPrice, maxPrice, sortBy } = req.query;

    const sort = { position: "asc" };
    const find = {
      product_category_id: { $in: [categoryRoot.id, ...subCategories_id] },
      deleted: false,
      availabilityStatus: "In Stock",
    };

    //filter categories
    if (category) {
      const categoryId = await ProductCategory.findOne({
        slug: category,
      }).select("_id");
      const subCategories = await subCategoriesHelper(categoryId.id);
      const subCategories_id = subCategories.map((e) => e.id);
      delete find.product_category_id;
      find["product_category_id"] = {
        $in: [categoryId.id, ...subCategories_id],
      };
    }
    //filter price
    if (minPrice && maxPrice) {
      find.price = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      };
    }

    //get max min price
    const priceRange = await Product.aggregate([
      {
        $match: {
          ...find,
        },
      },
      {
        $group: {
          _id: null,
          min: { $min: "$price" },
          max: { $max: "$price" },
        },
      },
    ]);

    const min = priceRange[0]?.min || 0;
    const max = priceRange[0]?.max || 0;

    //sort
    if (sortBy && sortBy != "default") {
      const [type, value] = sortBy.split("-");
      delete sort.position;
      sort[type] = value;
    }

    //get products
    const products = await Product.find(find).sort(sort);
    const categoriesFilter = await ProductCategory.find({
      deleted: false,
      status: "active",
      parent_id: categoryRoot.id,
    }).select("title slug");
    //get post
    const posts = await Post.find({
      deleted: false,
      status: "active",
      isFeatured: true,
    })
      .sort({ position: "desc" })
      .limit(8)
      .select("title thumbnail slug createdAt");

    const newProducts = calculatorHelper.newPrice(products);
    res.render("client/pages/products/index", {
      titlePage: categoryRoot.title,
      listProduct: newProducts,
      categories: categoriesFilter, // Danh mục cho bộ lọc
      articles: posts, // Tin tức sidebar
      totalProducts: 150, // Tổng số sản phẩm
      selectedCategory: category, // Category đang chọn
      defaultPriceMin: min,
      defaultPriceMax: max,
      filters: {
        minPrice: minPrice,
        maxPrice: maxPrice,
        rating: 4,
      },
      sortBy: sortBy || "default", // Kiểu sắp xếp
      pagination: {
        currentPage: 1,
        totalPages: 13,
        limit: 12,
      },
      queryString: "&category=beauty&sortBy=price-desc",
    });
  } catch (error) {
    console.log(error);
    res.send("404");
  }
};
