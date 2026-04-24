# 🔍 Code Review — Product Management Backend

> **Reviewer:** Senior Backend Engineer  
> **Project:** product-management (Express.js + MongoDB/Mongoose + Pug)  
> **Date:** 2026-04-24  

---

## 📋 Tổng quan Project

| Tiêu chí | Đánh giá |
|---|---|
| **Stack** | Express 5.1 + Mongoose 8 + Pug (SSR) |
| **Architecture** | MVC — tách rõ `model`, `controller`, `routes`, `middlewares`, `validates`, `helper` |
| **Modules** | Product, Category (tree), Post/Blog, Order, Cart, Account (Admin), User (Client), Role/Permission, Settings, Forgot Password/OTP |
| **Deployment** | Vercel (có `vercel.json`), Cloudinary (upload ảnh), Nodemailer (gửi mail) |

### Điểm tích cực ✅

1. **Cấu trúc MVC rõ ràng** — tách biệt `admin` vs `client` ở cả controller, routes, middleware
2. **Soft-delete pattern** — dùng flag `deleted: true` thay vì xóa thật, có tracking `deletedBy`, `deletedAt`
3. **Role-based Access Control (RBAC)** — có hệ thống phân quyền với `checkPermission` middleware
4. **Category tree** — hỗ trợ danh mục đa cấp (parent-child) cho cả Product & Post
5. **Cart với TTL** — guest cart tự hết hạn sau 24h, cart merge khi login
6. **Cloudinary integration** — upload ảnh qua stream, không lưu file local
7. **Pagination helper** — tái sử dụng được cho nhiều module
8. **Dashboard thống kê** — dùng MongoDB Aggregation pipeline
9. **OTP Forgot Password** — có flow hoàn chỉnh: gửi OTP → verify → reset password
10. **Setting Singleton** — cấu hình website chỉ 1 record

---

## 🚨 Các vấn đề nghiêm trọng (Critical Issues)

### 1. 🔴 File `.env` bị commit lên repository

[.env](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/.env)

> [!CAUTION]
> File `.env` chứa **tất cả credentials** (MongoDB URI, Cloudinary keys, Gmail password) đang nằm trong source code. Dù `.gitignore` đã list `.env`, file này **đã tồn tại** trong repository. Bất kỳ ai có access đều thấy:
> - MongoDB Atlas connection string (bao gồm password)  
> - Cloudinary API key + secret  
> - Gmail app password  

**Fix ngay:**
```bash
# Xóa khỏi git tracking (giữ file local)
git rm --cached .env
git commit -m "Remove .env from tracking"

# Rotate TẤT CẢ credentials — vì chúng đã bị expose
```

### 2. 🔴 Sử dụng MD5 để hash password

[auth.controller.js:L27](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/auth.controller.js#L27) | [account.controller.js:L45](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/account.controller.js#L45) | [user.controller.js:L38-L64](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/client/user.controller.js#L38-L64)

> [!CAUTION]
> **MD5 KHÔNG phải hashing algorithm** — nó là digest function, đã bị crack hoàn toàn. Không có salt, không có cost factor. Toàn bộ password trong DB có thể bị giải ngược bằng rainbow table trong vài giây.

**Fix:** Thay bằng `bcrypt`:
```javascript
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 12;

// Hash
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// Verify
const isMatch = await bcrypt.compare(inputPassword, user.password);
```

### 3. 🔴 Authentication bằng static token trong cookie (không hết hạn)

[auth.controller.js:L36-L38](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/auth.controller.js#L36-L38)

```javascript
// Token KHÔNG BAO GIỜ thay đổi, được set sẵn khi tạo account
res.cookie("token", user.token, {
  expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 NĂM!
});
```

> [!WARNING]
> - Token là static string random, **không hết hạn, không rotate** — nếu bị đánh cắp thì attacker có quyền vĩnh viễn
> - Cookie **thiếu flags**: `httpOnly`, `secure`, `sameSite`
> - Không có cơ chế invalidate session

**Fix:** Dùng JWT hoặc session-based auth với proper configuration:
```javascript
res.cookie("token", user.token, {
  httpOnly: true,       // Chống XSS
  secure: true,         // Chỉ gửi qua HTTPS
  sameSite: "strict",   // Chống CSRF
  maxAge: 24 * 60 * 60 * 1000, // 24h thay vì 1 năm
});
```

### 4. 🔴 Token được generate khi define schema — KHÔNG phải khi tạo document

[account.model.js:L13](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/model/account.model.js#L11-L14) | [user.model.js:L20](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/model/user.model.js#L18-L21)

```javascript
token: {
  type: String,
  default: generateRandom.randomString(30), // ⚠️ Gọi 1 lần khi require()
}
```

> [!CAUTION]
> `generateRandom.randomString(30)` được gọi **MỘT LẦN DUY NHẤT** khi file model được `require()`. Nghĩa là **TẤT CẢ accounts/users sẽ có CÙNG MỘT token** nếu không override thủ công! Đây là lỗi cực kỳ nghiêm trọng.

**Fix:** Dùng function reference thay vì function call:
```javascript
token: {
  type: String,
  default: () => generateRandom.randomString(30), // Arrow function → gọi lại mỗi document
}
```

---

## ⚠️ Các vấn đề về Architecture & Code Quality

### 5. 🟠 Truyền `req.body` thẳng vào Database (Mass Assignment)

[product.controller.js:L188](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/product.controller.js#L188) | [account.controller.js:L46](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/account.controller.js#L46) | [role.controller.js:L23](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/role.controller.js#L23)

```javascript
// Attacker có thể inject BẤT KỲ field nào vào req.body
const addProduct = new Product(req.body);     // ⚠️ 
await Role.updateOne({ _id: id }, req.body);  // ⚠️ còn nguy hiểm hơn
```

> [!WARNING]
> User có thể thêm fields như `deleted: false`, `role_id: "admin_role_id"`, `permissions: [...]` vào form data để escalate privilege.

**Fix:** Luôn whitelist fields:
```javascript
const { title, description, price, discountPercentage, stock, product_category_id, position } = req.body;
const addProduct = new Product({ title, description, price, ... });
```

### 6. 🟠 N+1 Query Problem — Loop query trong controller

[product.controller.js:L51-L60](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/product.controller.js#L51-L60) | [account.controller.js:L11-L16](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/account.controller.js#L11-L16) | [post.controller.js:L42-L49](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/post.controller.js#L42-L49)

```javascript
// ❌ N+1: Mỗi product → 1 query tìm account
for (const product of products) {
  if (product.updatedBy) {
    const user = await Account.findOne({ _id: product.updatedBy }).select("fullName");
    product.updatedByFullName = user.fullName;
  }
}
```

Với 100 products → 100 queries phụ. Pattern này lặp lại ở **rất nhiều controller**.

**Fix:** Batch query:
```javascript
const updaterIds = products.map(p => p.updatedBy).filter(Boolean);
const accounts = await Account.find({ _id: { $in: updaterIds } }).select("fullName");
const accountMap = Object.fromEntries(accounts.map(a => [a._id.toString(), a.fullName]));

products.forEach(p => {
  p.updatedByFullName = accountMap[p.updatedBy] || "";
});
```

### 7. 🟠 Không có Global Error Handler

[index.js](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/index.js)

> [!IMPORTANT]
> Không có error handling middleware. Nếu bất kỳ async function nào throw error mà không catch → **server crash** (unhandled rejection) hoặc **leak stack trace** cho client.

**Fix:** Thêm vào cuối `index.js`:
```javascript
// 404 handler
app.use((req, res) => {
  res.status(404).render("errors/404");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500", { message: "Internal Server Error" });
});
```

### 8. 🟠 Async handlers không được wrap — tiềm ẩn crash server

Hầu hết controller functions là `async` nhưng **không có try-catch**, ví dụ:

[product.controller.js:L72-L84](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/product.controller.js#L72-L84)

```javascript
// Nếu id không hợp lệ → CastError → Unhandled Rejection → crash
module.exports.changeStatus = async (req, res) => {
  await Product.updateOne({ _id: id }, { ... }); // Không try-catch
};
```

**Fix:** Tạo wrapper:
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
Router.patch("/change-status/:status/:id", asyncHandler(controller.changeStatus));
```

### 9. 🟡 Validation quá đơn giản — chỉ có 1 file, chỉ check `title`

[product.validate.js](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/validates/admin/product.validate.js)

```javascript
// Toàn bộ validation chỉ có... 1 check
module.exports.createProduct = (req, res, next) => {
  if (!req.body.title) { ... }
  next();
};
```

> [!WARNING]
> - Không validate: email format, password strength, số điện thoại, giá tiền (có thể là số âm?), discount (có thể > 100?), stock
> - Các module khác (Account, Order, Post, Category, Role) **KHÔNG CÓ VALIDATION NÀO**

**Fix:** Dùng thư viện validation như `joi` hoặc `express-validator`:
```javascript
const Joi = require("joi");

const productSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  price: Joi.number().required().min(0),
  discountPercentage: Joi.number().min(0).max(100).default(0),
  stock: Joi.number().integer().min(0),
  // ...
});
```

### 10. 🟡 Duplicate code lớn giữa Cart controller và Checkout controller

[cart.controller.js:L5-L82](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/client/cart.controller.js#L5-L82) vs [checkout.controller.js:L6-L79](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/client/checkout.controller.js#L6-L79)

Hai function `index()` có logic **gần như giống hệt** (tính giá, build cartProducts, etc). Nếu sửa logic tính giá ở 1 chỗ, chỗ kia sẽ sai.

**Fix:** Extract ra service/helper:
```javascript
// services/cart.service.js
module.exports.getCartWithProducts = async (cartId) => {
  // Logic chung xử lý cart + products + tính giá
};
```

### 11. 🟡 `forEach` với `async` — operations không được await

[product-category.controller.js:L78-L83](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/product-category.controller.js#L78-L83) | [role.controller.js:L42-L44](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/role.controller.js#L42-L44)

```javascript
// ❌ forEach KHÔNG await async callbacks
ids.forEach(async (e) => {
  await ProductCategory.updateOne({ _id: e }, { status: "active" });
});
// Flash + redirect thực thi TRƯỚC KHI updates hoàn thành!
req.flash("success", "..."); // Chạy ngay, không đợi
```

**Fix:** Dùng `for...of` hoặc `Promise.all()`:
```javascript
// Option 1: Sequential
for (const e of ids) {
  await ProductCategory.updateOne({ _id: e }, { status: "active" });
}

// Option 2: Parallel (nhanh hơn)
await Promise.all(ids.map(id => 
  ProductCategory.updateOne({ _id: id }, { status: "active" })
));
```

### 12. 🟡 `createTree` helper dùng biến global `count` — không thread-safe

[createTreeCategory.helper.js:L1](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/helper/createTreeCategory.helper.js#L1)

```javascript
let count = 0; // ⚠️ Global mutable state
const createTree = (array, parentId = "") => {
  // ...
  newItem.index = count++; // Race condition nếu 2 request đồng thời
};
```

Với Node.js single-thread thì hiếm khi xảy ra vấn đề, nhưng đây là anti-pattern. Nên truyền `count` qua closure hoặc parameter.

### 13. 🟡 Lỗi typo trong code

[product.controller.js:L133](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/product.controller.js#L133): `ids.lenght` → `ids.length`  
[post.controller.js:L130](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/post.controller.js#L130): `daletedBy` → `deletedBy`  
[search.controller.js:L17](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/client/search.controller.js#L17): `titlePage: "seach"` → `"search"`  
[cart.controller.js:L135](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/client/cart.controller.js#L135): Flash message xóa sản phẩm nhưng hiển thị "đã thêm thêm vào giỏ hàng!"

### 14. 🟡 Hardcoded values (magic numbers/strings)

[product.controller.js:L106](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/client/product.controller.js#L106): `totalProducts: 150` — giá trị hardcode, không phải count thật

[home.controller.js:L46](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/client/home.controller.js#L46): Hero image URL hardcoded trong controller thay vì lấy từ Settings

[index.js:L34](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/index.js#L34): Cookie parser secret hardcoded: `"keyboard cat"`

### 15. 🟡 `console.log` dùng thay cho proper logging

Toàn bộ project dùng `console.log()` / `console.error()` trực tiếp. Không có log levels, không có log format, không ghi ra file.

**Fix:** Dùng logging library:
```javascript
const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.Console(),
  ],
});
```

---

## 🔒 Security Issues

### 16. 🔴 Không có CSRF Protection

Admin panel dùng `method-override` + form POST/PATCH/DELETE nhưng **không có CSRF token**. Attacker có thể tạo form giả trên website khác để thực hiện actions (xóa product, thay đổi role...) thay admin.

**Fix:** Dùng `csurf` middleware hoặc SameSite cookies.

### 17. 🟠 Không có Rate Limiting

Login endpoints (`/admin/auth/login`, `/user/login`) không có rate limit → brute force attack dễ dàng. Đặc biệt nguy hiểm khi password hash bằng MD5.

**Fix:**
```javascript
const rateLimit = require("express-rate-limit");
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần thử
  message: "Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút",
});
app.use("/admin/auth/login", loginLimiter);
```

### 18. 🟠 ReDoS (Regular Expression Denial of Service)

[product.controller.js:L21](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/controller/admin/product.controller.js#L21)

```javascript
const keyRegex = new RegExp(keyword, "i"); // User input trực tiếp vào regex!
```

User có thể gửi `keyword=((((((((((a` → regex catastrophic backtracking → server hang.

**Fix:** Escape regex hoặc dùng `$text` search:
```javascript
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const keyRegex = new RegExp(escapeRegex(keyword), "i");
```

### 19. 🟠 Cloudinary `cloud_name` bị hardcode

[uploadCloud.middleware.js:L5](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/middlewares/admin/uploadCloud.middleware.js#L5)

```javascript
cloudinary.config({
  cloud_name: "dygsbwyjo", // ⚠️ Hardcoded thay vì dùng env
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});
```

---

## 📊 Performance Issues

### 20. 🟠 Middleware query DB **trên mỗi request**

[setting.middleware.js](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/middlewares/client/setting.middleware.js) + [getCategories.middleware.js](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/middlewares/client/getCategories.middleware.js)

Hai middleware này chạy **TRÊN MỌI CLIENT REQUEST** — mỗi page load = 2 extra DB queries cho data ít khi thay đổi.

**Fix:** Cache với TTL:
```javascript
let cachedSettings = null;
let cacheExpiry = 0;

module.exports = async (req, res, next) => {
  if (!cachedSettings || Date.now() > cacheExpiry) {
    cachedSettings = await Setting.findOne({}).select("general contact social_media").lean();
    cacheExpiry = Date.now() + 5 * 60 * 1000; // Cache 5 phút
  }
  res.locals.settingGeneral = cachedSettings;
  next();
};
```

### 21. 🟡 Không dùng `.lean()` cho read queries

Phần lớn queries trong project không dùng `.lean()`. Mongoose documents có overhead lớn (getters, setters, change tracking). Với queries chỉ đọc, `.lean()` giảm ~5x memory và tăng tốc đáng kể.

### 22. 🟡 `subCategories` helper — Recursive DB queries

[subCategories.js](file:///d:/Khoa_NodeJs/28tech/CODE/product-management/helper/subCategories.js)

```javascript
// Đệ quy → mỗi level = 1 query. Cây 5 cấp = 5+ queries
const getSubCategories = async (parent_id) => {
  const subCategories = await ProductCategory.find({ parent_id });
  for (const element of subCategories) {
    const subs = await getSubCategories(element.id); // ⚠️ Recursive query
  }
};
```

**Fix:** Lấy hết category 1 lần, build tree trong memory:
```javascript
const allCategories = await ProductCategory.find({ deleted: false, status: "active" }).lean();
const getSubIds = (parentId, all) => {
  const children = all.filter(c => c.parent_id === parentId);
  return children.reduce((acc, c) => [...acc, c._id, ...getSubIds(c._id.toString(), all)], []);
};
```

---

## 🧩 Thiếu sót về Architecture

| Thiếu sót | Impact |
|---|---|
| **Không có Service Layer** | Business logic nằm trực tiếp trong controller → khó test, khó reuse |
| **Không có test** | Không có unit test hay integration test nào |
| **Không có API documentation** | Dù là SSR, vẫn cần doc cho các PATCH/POST endpoints |
| **Không tách env config** | Không có `config/` cho dev/staging/production |
| **Không có health check endpoint** | Cần cho monitoring và deployment |
| **Session store dùng memory** | `express-session` default = MemoryStore → memory leak, mất khi restart |

---

## 💡 Đề xuất tính năng nên thêm

### Ưu tiên cao (Nên làm ngay)

| # | Tính năng | Mô tả |
|---|---|---|
| 1 | **Input Sanitization** | Dùng `express-mongo-sanitize` để chống NoSQL injection, `xss-clean` để chống XSS |
| 2 | **CORS Configuration** | Thêm `cors` middleware nếu có API calls từ domain khác |
| 3 | **Helmet.js** | Security headers (CSP, X-Frame-Options, etc.) — 1 dòng code thêm bảo mật đáng kể |
| 4 | **Request Body Size Limit** | Giới hạn size upload để chống DoS: `express.json({ limit: "10kb" })` |
| 5 | **Inventory Management** | Khi checkout, cần **trừ stock** sản phẩm và kiểm tra tồn kho trước khi tạo order |

### Ưu tiên trung bình (Nâng cấp trải nghiệm)

| # | Tính năng | Mô tả |
|---|---|---|
| 6 | **Product Reviews & Ratings** | Cho phép user đánh giá sản phẩm — hiện đang hardcode testimonials |
| 7 | **Wishlist / Yêu thích** | Cho user lưu sản phẩm yêu thích |
| 8 | **Email xác nhận đơn hàng** | Đã có Nodemailer setup, chỉ cần thêm template cho order confirmation |
| 9 | **Trash/Recycle Bin** | Đã có soft-delete, cần thêm UI và API để khôi phục items đã xóa |
| 10 | **Audit Log** | Ghi lại ai đã làm gì, khi nào — quan trọng cho admin panel |

---

## 📝 Tóm tắt điểm số

| Khía cạnh | Điểm | Ghi chú |
|---|---|---|
| **Cấu trúc / MVC** | ⭐⭐⭐⭐ | Tách biệt tốt, naming rõ ràng |
| **Security** | ⭐⭐ | MD5, static token, CSRF, mass assignment — cần fix ngay |
| **Error Handling** | ⭐⭐ | Thiếu global handler, nhiều endpoint không catch error |
| **Code Quality** | ⭐⭐⭐ | Typos, duplicate code, nhưng nhìn chung readable |
| **Performance** | ⭐⭐⭐ | N+1 queries, missing `.lean()`, nhưng pagination + Cloudinary stream tốt |
| **Validation** | ⭐ | Gần như không có |
| **Testing** | ☆ | Không có test nào |
| **Tổng thể** | ⭐⭐⭐ / 5 | **Đủ tốt cho học tập, chưa sẵn sàng cho production** |

> [!TIP]
> Project có nền tảng kiến trúc tốt. Để đưa lên production, ưu tiên **fix security** (MD5 → bcrypt, token generation, CSRF, mass assignment), thêm **validation layer** với Joi, và wrap toàn bộ async handler với error middleware. Những thay đổi này không phá vỡ cấu trúc hiện tại.
