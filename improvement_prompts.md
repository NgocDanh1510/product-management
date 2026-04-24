# 📋 Danh sách Prompt cải tiến — Product Management Backend

> Các prompt được chia nhỏ theo thứ tự ưu tiên. Mỗi prompt là một task độc lập, có thể copy/paste để thực hiện.
> 
> ✅ = Đã hoàn thành | 🔲 = Chưa làm

---

## Nhóm 1: Security (Ưu tiên cao nhất)

### ✅ Prompt 1 — MD5 → Bcrypt (ĐÃ LÀM)
### ✅ Prompt 2 — Random Token → JWT (ĐÃ LÀM)

### 🔲 Prompt 3 — Chống Mass Assignment
```
Hiện tại nhiều controller đang truyền thẳng req.body vào Database (new Product(req.body), 
Model.updateOne({}, req.body)). Điều này cho phép attacker inject bất kỳ field nào.

Hãy sửa tất cả controller trong project để whitelist các fields được phép trước khi 
save/update vào DB. Áp dụng cho các file:
- controller/admin/product.controller.js (createProduct, editProduct)
- controller/admin/account.controller.js (createPost, editPatch)
- controller/admin/role.controller.js (createPost, editPatch)
- controller/admin/product-category.controller.js (createProductCategory, editProductCategory)
- controller/admin/post-category.controller.js (createPostCategory, editPostCategory)
- controller/admin/post.controller.js (createPost, editPost)
- controller/admin/setting.controller.js (generalPatch)
```

### 🔲 Prompt 4 — Thêm Security Middleware (Helmet, Rate Limit, Mongo Sanitize)
```
Hãy thêm các middleware bảo mật vào project:
1. helmet — security headers (CSP, X-Frame-Options...)
2. express-rate-limit — giới hạn request trên login endpoints (5 lần / 15 phút)
3. express-mongo-sanitize — chống NoSQL injection
4. Giới hạn body size: express.json({ limit: "10kb" })

Cài package và thêm vào index.js, đảm bảo thứ tự middleware đúng.
```

### 🔲 Prompt 5 — Escape Regex Input (chống ReDoS)
```
Hiện tại các controller đang truyền thẳng user input vào RegExp:
  const keyRegex = new RegExp(keyword, "i");

Điều này cho phép ReDoS attack. Hãy tạo một helper function escapeRegex() 
và áp dụng cho TẤT CẢ chỗ dùng RegExp với user input trong project:
- controller/admin/product.controller.js
- controller/admin/product-category.controller.js
- controller/admin/post-category.controller.js
- controller/admin/post.controller.js
- controller/admin/order.controller.js
- controller/client/product.controller.js (nếu có)
- controller/client/search.controller.js
```

---

## Nhóm 2: Error Handling & Stability

### 🔲 Prompt 6 — Global Error Handler + Async Wrapper
```
Project hiện không có global error handler. Async controller functions không có try-catch 
sẽ crash server.

Hãy:
1. Tạo helper/asyncHandler.js — wrapper function cho async route handlers
2. Thêm 404 handler và global error handler middleware vào cuối index.js
3. Áp dụng asyncHandler vào TẤT CẢ routes trong routes/admin/ và routes/client/
   để wrap các controller functions

Ví dụ: Router.get("/", asyncHandler(controller.index))
```

### 🔲 Prompt 7 — Fix forEach + async (operations không được await)
```
Nhiều chỗ trong project dùng ids.forEach(async (e) => { await Model.updateOne(...) })
— forEach không await async callbacks, nên flash message và redirect chạy trước khi 
DB update hoàn thành.

Hãy sửa TẤT CẢ chỗ dùng forEach với async callback sang for...of hoặc Promise.all():
- controller/admin/product-category.controller.js (changeMulti)
- controller/admin/post-category.controller.js (changeMulti)
- controller/admin/role.controller.js (permissionPatch)
```

---

## Nhóm 3: Validation

### 🔲 Prompt 8 — Thêm Input Validation với Joi
```
Hiện tại chỉ có 1 file validation (product.validate.js) và chỉ check field title.

Hãy:
1. Cài đặt thư viện joi
2. Tạo validates/schemas/ chứa các validation schema:
   - product.schema.js (title required min 3, price >= 0, discountPercentage 0-100, stock >= 0)
   - account.schema.js (email format, password min 6, phone format)
   - user.schema.js (fullName required, email format, password min 6)
   - order.schema.js (userInfor required, products array not empty)
   - role.schema.js (title required)
3. Tạo validates/validate.middleware.js — middleware chung nhận schema và validate req.body
4. Áp dụng vào các routes tương ứng (create và edit)
```

---

## Nhóm 4: Performance

### 🔲 Prompt 9 — Fix N+1 Query Problem
```
Nhiều controller đang loop query Account cho mỗi item (product, post, category) 
để lấy fullName của người tạo/cập nhật. Với 100 items = 100 queries phụ.

Hãy refactor bằng cách batch query — thu thập tất cả IDs, query 1 lần, 
rồi map kết quả. Áp dụng cho:
- controller/admin/product.controller.js (index, detail)
- controller/admin/product-category.controller.js (index, detail)
- controller/admin/post-category.controller.js (index, detail)
- controller/admin/post.controller.js (index, detail)
- controller/admin/account.controller.js (index — loop query Role)
- controller/client/post.controller.js (index — loop query PostCategory)
```

### 🔲 Prompt 10 — Cache middleware queries + thêm .lean()
```
Hai middleware chạy trên MỌI client request nhưng query data ít thay đổi:
- middlewares/client/setting.middleware.js (query Settings)
- middlewares/client/getCategories.middleware.js (query ProductCategory)

Hãy:
1. Thêm in-memory cache với TTL (5 phút) cho cả 2 middleware
2. Thêm .lean() cho tất cả read-only queries trong project (queries chỉ đọc, 
   không cần Mongoose document methods) để giảm memory và tăng tốc
```

### 🔲 Prompt 11 — Fix recursive DB queries trong subCategories helper
```
File helper/subCategories.js dùng đệ quy gọi DB cho mỗi cấp danh mục.
Cây 5 cấp = 5+ queries.

Hãy refactor: lấy tất cả categories 1 lần rồi build tree trong memory 
thay vì recursive DB calls.
```

---

## Nhóm 5: Code Quality & DRY

### 🔲 Prompt 12 — Extract Cart/Checkout logic thành Service
```
controller/client/cart.controller.js (index) và controller/client/checkout.controller.js (index)
có logic tính giá gần như giống hệt nhau (50+ dòng duplicate).

Hãy tạo helper/cart.helper.js (hoặc services/cart.service.js) chứa function 
getCartWithProducts(cartId) để cả 2 controller cùng dùng.
```

### 🔲 Prompt 13 — Fix typos và hardcoded values
```
Sửa các lỗi typo và hardcoded values trong project:

Typos:
- controller/admin/product.controller.js:L133 — ids.lenght → ids.length
- controller/admin/post.controller.js:L130 — daletedBy → deletedBy
- controller/client/search.controller.js:L17 — titlePage: "seach" → "search"
- controller/client/cart.controller.js:L135 — flash "đã thêm thêm vào giỏ hàng" (xóa SP nhưng message thêm)

Hardcoded values:
- controller/client/product.controller.js:L106 — totalProducts: 150 → dùng count thật
- index.js:L34 — cookie parser secret "keyboard cat" → dùng biến env
- index.js:L39 — session secret "keyboard cat" → dùng biến env
```

### 🔲 Prompt 14 — Thêm Logging với Winston
```
Thay thế tất cả console.log/console.error bằng Winston logger.

Hãy:
1. Cài winston
2. Tạo helper/logger.js với format timestamp + JSON, ghi error ra file error.log
3. Thay thế console.log/console.error trong toàn bộ project
```

---

## Nhóm 6: Features mới

### 🔲 Prompt 15 — Trừ stock khi checkout (Inventory Management)
```
Hiện tại khi đặt hàng (checkout/order), hệ thống KHÔNG trừ stock sản phẩm.

Hãy thêm logic:
1. Kiểm tra tồn kho trước khi tạo order (mỗi product phải có stock >= quantity)
2. Trừ stock sau khi order thành công
3. Hoàn stock nếu order bị cancelled
Sửa ở controller/client/checkout.controller.js và controller/admin/order.controller.js
```

### 🔲 Prompt 16 — Email xác nhận đơn hàng
```
Project đã có Nodemailer setup (helper/sendMail.js). 
Hãy thêm gửi email xác nhận khi đặt hàng thành công.

Tạo template HTML chứa: thông tin đơn hàng, danh sách sản phẩm, tổng tiền, 
trạng thái. Gửi email trong controller/client/checkout.controller.js sau khi save order.
```

### 🔲 Prompt 17 — Trash/Recycle Bin (khôi phục items đã xóa)
```
Project đã có soft-delete (deleted: true) nhưng chưa có cách khôi phục.

Hãy thêm cho module Product:
1. Route GET /admin/products/trash — hiển thị danh sách sản phẩm đã xóa
2. Route PATCH /admin/products/restore/:id — khôi phục 1 sản phẩm
3. Route DELETE /admin/products/force-delete/:id — xóa vĩnh viễn
4. Thêm permission tương ứng
```

---

## Thứ tự thực hiện đề xuất

| Giai đoạn | Prompts | Mục tiêu |
|---|---|---|
| **Sprint 1** | 3, 4, 5 | Fix security còn lại |
| **Sprint 2** | 6, 7 | Ổn định error handling |
| **Sprint 3** | 8 | Validation layer |
| **Sprint 4** | 9, 10, 11 | Tối ưu performance |
| **Sprint 5** | 12, 13, 14 | Code quality |
| **Sprint 6** | 15, 16, 17 | Features mới |
