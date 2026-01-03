const Product = require("../../model/product.model");
const ProductCategory = require("../../model/product-category.model");
const calculaor = require("../../helper/calculator");

// [GET] /
module.exports.index = async (req, res) => {
  const categories = await ProductCategory.find({
    deleted: false,
    status: "active",
    $or: [{ parent_id: "" }, { parent_id: { $exists: false } }],
  })
    .sort({ position: 1 })
    .limit(8)
    .select("title description thumbnail slug isFeatured");

  const productIsFeatureds = await Product.find({
    isFeatured: true,
    availabilityStatus: "In Stock",
    deleted: false,
  })
    .sort({
      position: "desc",
    })
    .limit(4);
  const productIsFeaturedsNew = calculaor.newPrice(productIsFeatureds);

  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",

    // Hero Banner - Full Width
    hero: {
      title: "Chào mừng đến với Mega Mart",
      description:
        "Siêu thị trực tuyến hàng đầu với hàng ngàn sản phẩm chất lượng",
      image:
        "https://res.cloudinary.com/dygsbwyjo/image/upload/v1767276534/Gemini_Generated_Image_9p5zsg9p5zsg9p5z_v706sp.png", // Ảnh banner rộng
    },

    // Features
    features: [
      {
        icon: "bi-truck",
        title: "Giao hàng miễn phí",
        description: "Miễn phí vận chuyển cho đơn hàng trên 500K",
      },
      {
        icon: "bi-shield-check",
        title: "Thanh toán bảo mật",
        description: "An toàn tuyệt đối với mọi giao dịch",
      },
      {
        icon: "bi-arrow-repeat",
        title: "Đổi trả dễ dàng",
        description: "Hoàn tiền 100% trong vòng 7 ngày",
      },
    ],

    // Categories - Danh mục nổi bật
    categories: categories,

    // Products
    products: productIsFeaturedsNew,

    // Articles/News - Tin tức & Blog
    articles: [
      {
        title: "Top 10 điện thoại đáng mua nhất năm 2024",
        slug: "top-10-dien-thoai-dang-mua-2024",
        excerpt:
          "Tổng hợp những chiếc điện thoại có cấu hình mạnh mẽ, giá cả hợp lý nhất trong năm...",
        image: "/images/blog/article1.jpg",
        date: "15/12/2024",
        author: "Nguyễn Văn A",
      },
      {
        title: "Hướng dẫn chọn laptop phù hợp cho sinh viên",
        slug: "huong-dan-chon-laptop-sinh-vien",
        excerpt:
          "Những tiêu chí quan trọng khi lựa chọn laptop cho học tập và giải trí...",
        image: "/images/blog/article2.jpg",
        date: "10/12/2024",
        author: "Trần Thị B",
      },
      {
        title: "Mega Mart khai trương chi nhánh mới tại Hà Nội",
        slug: "mega-mart-khai-truong-ha-noi",
        excerpt:
          "Sự kiện khai trương với nhiều ưu đãi hấp dẫn dành cho khách hàng tại Hà Nội...",
        image: "/images/blog/article3.jpg",
        date: "05/12/2024",
        author: "Lê Văn C",
      },
    ],

    // Testimonials
    testimonials: [
      {
        name: "Nguyễn Văn A",
        avatar: "/images/avatars/user1.jpg",
        rating: 5,
        comment:
          "Sản phẩm chất lượng, giao hàng nhanh chóng. Tôi rất hài lòng với dịch vụ của Mega Mart!",
      },
      {
        name: "Trần Thị B",
        avatar: "/images/avatars/user2.jpg",
        rating: 5,
        comment:
          "Giá cả cạnh tranh, nhân viên tư vấn nhiệt tình. Chắc chắn sẽ quay lại mua sắm!",
      },
      {
        name: "Lê Văn C",
        avatar: "/images/avatars/user3.jpg",
        rating: 4,
        comment:
          "Đa dạng sản phẩm, dễ dàng tìm kiếm. Mega Mart là lựa chọn số 1 của tôi!",
      },
    ],
  });
};
