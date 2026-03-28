# Product Management System

Hệ thống quản lý sản phẩm và bán hàng trực tuyến được xây dựng bằng Node.js và Express.js.

## Mô Tả

Ứng dụng cung cấp hai giao diện chính:

- **Admin**: Quản lý sản phẩm, danh mục, đơn hàng, người dùng, bài viết
- **Client**: Mua sắm sản phẩm, quản lý giỏ hàng, thanh toán, theo dõi đơn hàng

## Yêu Cầu

- Node.js >= 14.x
- MongoDB
- npm hoặc yarn

## Cài Đặt

1. Clone hoặc tải project về máy

2. Cài đặt các package phụ thuộc:

```bash
npm install
```

3. Tạo file `.env` trong thư mục gốc (copy từ `.env.example` nếu có):

```
MONGODB_URL=mongodb://localhost:27017/product-management
PORT=3000
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
MAIL_HOST=your_mail_host
MAIL_PORT=your_mail_port
MAIL_USER=your_mail_user
MAIL_PASSWORD=your_mail_password
```

## Chạy Ứng Dụng

### Chế độ phát triển (với hot reload):

```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Chế độ production:

```bash
NODE_ENV=production node index.js
```

## Cấu Trúc Thư Mục

```
project-management/
├── config/              # Cấu hình database và hệ thống
│   ├── database.js      # Kết nối MongoDB
│   └── system.js        # Cấu hình hệ thống
│
├── controller/          # Logic xử lý
│   ├── admin/           # Controller cho admin
│   └── client/          # Controller cho khách hàng
│
├── helper/              # Các hàm tiện ích
│   ├── calculator.js
│   ├── sendMail.js
│   ├── pagination.js
│   └── ...
│
├── middlewares/         # Middleware
│   ├── admin/           # Middleware cho admin
│   └── client/          # Middleware cho khách hàng
│
├── model/               # MongoDB schemas
│   ├── user.model.js
│   ├── product.model.js
│   ├── order.model.js
│   └── ...
│
├── routes/              # API routes
│   ├── admin/
│   └── client/
│
├── views/               # Template Pug
│   ├── admin/           # Template admin
│   │   └── pages/
│   └── client/          # Template client
│       └── pages/
│
├── public/              # File tĩnh
│   ├── css/
│   ├── js/
│   └── image/
│
├── index.js             # Entry point
├── package.json
└── README.md            # File này
```

## Tính Năng

### Phía Admin

- Bảng điều khiển (Dashboard) với thống kê
- Quản lý sản phẩm (thêm, sửa, xóa, lọc)
- Quản lý danh mục sản phẩm
- Quản lý đơn hàng
- Quản lý người dùng
- Quản lý bài viết (blog)
- Quản lý tài khoản admin
- Quản lý quyền hạn (roles)
- Cài đặt hệ thống

### Phía Khách Hàng

- Duyệt sản phẩm với lọc
- Tìm kiếm sản phẩm
- Xem chi tiết sản phẩm
- Quản lý giỏ hàng
- Thanh toán
- Quản lý tài khoản cá nhân
- Xem lịch sử đơn hàng
- Quên/đặt lại mật khẩu

## Công Nghệ Sử Dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Template Engine**: Pug
- **Frontend**: Bootstrap 5, JavaScript
- **File Upload**: Multer, Cloudinary
- **Email**: Nodemailer
- **Authentication**: Cookie, Session
- **Utility**: Markdown, method-override

## API Chính

### Routes Admin

- `/admin/dashboard` - Bảng điều khiển
- `/admin/product` - Quản lý sản phẩm
- `/admin/product-category` - Quản lý danh mục sản phẩm
- `/admin/order` - Quản lý đơn hàng
- `/admin/account` - Quản lý tài khoản admin
- `/admin/role` - Quản lý quyền hạn
- `/admin/post` - Quản lý bài viết
- `/admin/post-category` - Quản lý danh mục bài viết
- `/admin/setting` - Cài đặt hệ thống

### Routes Client

- `/` - Trang chủ
- `/product` - Danh sách sản phẩm
- `/product/:slug` - Chi tiết sản phẩm
- `/user/login` - Đăng nhập
- `/user/register` - Đăng ký
- `/user/info` - Thông tin cá nhân
- `/cart` - Giỏ hàng
- `/checkout` - Thanh toán
- `/order` - Lịch sử đơn hàng
- `/post` - Danh sách bài viết
- `/search` - Tìm kiếm

## Thông Tin Bổ Sung

- **Port mặc định**: 3000
- **Database**: MongoDB local hoặc MongoDB Atlas
- **Upload file**: Sử dụng Cloudinary
- **Email**: Cấu hình SMTP để gửi email

## Lưu Ý

- Đảm bảo MongoDB đang chạy trước khi khởi động ứng dụng
- Cấu hình biến môi trường (.env) với thông tin đúng
- CloudInary và Nodemailer cần được cấu hình để sử dụng tính năng upload và gửi email

## Tác Giả

ngocdanh

## License

ISC
