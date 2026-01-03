const Cart = require("../../model/cart.model");
const Product = require("../../model/product.model");

// [GET] /cart
module.exports.index = async (req, res) => {
  try {
    const cart = await Cart.findOne({ _id: req.cookies.cartId }).lean();

    // Khởi tạo tổng tiền
    let totalPrice = 0;
    let totalPriceNew = 0;

    // Nếu cart trống
    if (!cart || cart.products.length === 0) {
      cart.products = [];
      cart.totalPrice = 0;
      cart.totalPriceNew = 0;
      cart.totalDiscount = 0;
    }

    // Lấy danh sách product_id
    const productIds = cart.products.map((item) => item.product_id);

    // Lấy toàn bộ product trong 1 query
    const products = await Product.find({
      _id: { $in: productIds },
    })
      .select("title thumbnail price discountPercentage stock slug")
      .lean();

    // Map product theo id
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // Build lại cart.products để render
    const cartProducts = cart.products
      .map((item) => {
        const product = productMap[item.product_id.toString()];

        if (!product) return null; // sản phẩm đã bị xóa

        const priceNew = product.price * (1 - product.discountPercentage / 100);
        const itemTotalPrice = product.price * item.quantity;
        const itemTotalPriceNew = Number((priceNew * item.quantity).toFixed(2));

        totalPrice += itemTotalPrice;
        totalPriceNew += itemTotalPriceNew;

        return {
          product_id: product._id,
          quantity: item.quantity,
          detail: {
            title: product.title,
            thumbnail: product.thumbnail,
            price: product.price,
            discountPercentage: product.discountPercentage,
            priceNew: priceNew.toFixed(2),
            stock: product.stock,
            totalPrice: itemTotalPriceNew,
            slug: product.slug,
          },
        };
      })
      .filter(Boolean); // loại bỏ product null

    // Gán lại dữ liệu cho cart
    cart.products = cartProducts;
    cart.totalPrice = totalPrice;
    cart.totalPriceNew = Number(totalPriceNew.toFixed(2));
    cart.totalDiscount = Number((totalPrice - totalPriceNew).toFixed(2));

    // Render view
    res.render("client/pages/cart/index", {
      titlePage: "Giỏ hàng",
      cart: cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

//[POST] /cart/add-cart/:productId
module.exports.addCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = Number(req.body.quantity) || 1;
    const cartId = req.cookies.cartId;

    const updated = await Cart.updateOne(
      { _id: cartId, "products.product_id": productId },
      { $inc: { "products.$.quantity": quantity } }
    );

    if (updated.matchedCount === 0) {
      await Cart.updateOne(
        { _id: cartId },
        {
          $push: {
            products: { product_id: productId, quantity },
          },
        }
      );
    }
    req.flash("success", " đã thêm thêm vào giỏ hàng!");

    //back lai trang truoc
    res.redirect(req.get("Referrer"));
  } catch (err) {
    console.error(err);
    req.flash("error", "thêm vào giỏ hàng thất bại");

    //back lai trang truoc
    res.redirect(req.get("Referrer"));
  }
};

//[GET] /cart/delete/:productId
module.exports.delete = async (req, res) => {
  try {
    const productId = req.params.productId;
    const cartId = req.cookies.cartId;

    await Cart.updateOne(
      { _id: cartId },
      {
        $pull: {
          products: { product_id: productId },
        },
      }
    );

    req.flash("success", " đã thêm thêm vào giỏ hàng!");

    //back lai trang truoc
    res.redirect(req.get("Referrer"));
  } catch (err) {
    console.error(err);
    req.flash("error", "thêm vào giỏ hàng thất bại");

    //back lai trang truoc
    res.redirect(req.get("Referrer"));
  }
};

//[GET] /cart/upadte/:productId/:quantity
module.exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.params;

    const cartId = req.cookies.cartId;

    await Cart.updateOne(
      { _id: cartId, "products.product_id": productId },
      {
        $set: {
          "products.$.quantity": quantity,
        },
      }
    );

    res.status(200).end();
  } catch (err) {
    console.error(err);

    res.status(403).end();
  }
};
