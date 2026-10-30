**Trạng thái kiểm thử (28/10/2026):**

# Task 10.3 – Ingredient Inventory & Optimistic Locking

## 1. Mục tiêu

Task 10.3 tập trung xử lý vấn đề **đặt hàng đồng thời và kiểm soát tồn kho**, bảo đảm nhiều khách hàng không thể đặt vượt số lượng hàng còn lại.

Hệ thống sử dụng **PostgreSQL Transaction kết hợp Optimistic Locking** để bảo đảm tính nhất quán dữ liệu.

Ngoài yêu cầu cốt lõi, BrewLite đã mở rộng cơ chế tồn kho từ số lượng sản phẩm sang quản lý nguyên vật liệu dựa trên công thức pha chế, kích cỡ đồ uống và topping.

## 2. Các chức năng đã triển khai

### 2.1. Quản lý nguyên vật liệu (Ingredient Inventory)

Bổ sung bảng `Ingredient` gồm:

- `id`: mã nguyên liệu.
- `name`: tên nguyên liệu.
- `unit`: đơn vị tính (g, ml).
- `stock`: số lượng tồn kho.
- `version`: phiên bản dữ liệu phục vụ Optimistic Locking.

Hệ thống quản lý 12 nguyên liệu mẫu như bột cà phê, sữa tươi, sữa đặc, nước lọc, đường, siro, cacao, trân châu và các nguyên liệu khác.

### 2.2. Quản lý công thức pha chế (Recipe Management)

Bổ sung:

- `RecipeItem`: định lượng nguyên liệu theo sản phẩm và size.
- `ToppingRecipe`: định lượng nguyên liệu của topping.
- `OrderIngredient`: lưu số lượng từng nguyên liệu đã được giữ cho đơn hàng.

Hỗ trợ bốn kích cỡ: `DEFAULT`, `S`, `M`, `L`.

Dữ liệu mẫu gồm 10 đồ uống, 100 dòng công thức và 3 topping: Trân châu, Extra shot, Kem cheese.

### 2.3. Tính nguyên liệu cho toàn bộ đơn hàng

Khi khách tạo đơn qua `POST /orders`, backend:

1. Nhận danh sách sản phẩm, số lượng, size và topping.
2. Tra cứu công thức pha chế tương ứng.
3. Tính nguyên liệu cần dùng cho từng món.
4. Tổng hợp lượng nguyên liệu cần dùng của toàn bộ giỏ hàng.
5. Kiểm tra tồn kho trước khi cho phép đặt.

Nếu một nguyên liệu không đủ, yêu cầu đặt hàng sẽ bị từ chối.

### 2.4. Transaction và Optimistic Locking

Sử dụng Prisma Transaction để thực hiện việc trừ nguyên liệu và tạo đơn hàng trong cùng một giao dịch.

Optimistic Locking sử dụng các điều kiện:

- `id`: xác định nguyên liệu.
- `version`: xác nhận dữ liệu chưa bị thay đổi.
- `stock >= quantity`: bảo đảm còn đủ nguyên liệu.

Khi cập nhật thành công, hệ thống giảm `stock` và tăng `version`.

Nếu có xung đột hoặc không đủ nguyên liệu, Transaction thất bại và các thay đổi trong giao dịch được rollback.

### 2.5. Tích hợp Order State Machine

Bổ sung `Order.ingredientsReserved` nhằm theo dõi trạng thái giữ nguyên liệu.

Các trường hợp đã xử lý:

| Trạng thái | Xử lý tồn kho |
|---|---|
| Tạo Order PENDING | Trừ và giữ nguyên liệu |
| PENDING → PAID | Giữ nguyên liệu đã trừ |
| PENDING → CANCELLED | Hoàn nguyên liệu |
| PENDING → PAYMENT_FAILED | Hoàn nguyên liệu |
| PAYMENT_FAILED → PENDING | Kiểm tra và giữ nguyên liệu lại |
| PAID → CANCELLED | Hoàn nguyên liệu theo logic hiện tại |

`OrderIngredient` lưu định lượng tại thời điểm đặt hàng, giúp hoàn kho đúng ngay cả khi công thức pha chế được thay đổi sau đó.

Hệ thống cũng có cơ chế tránh hoàn kho nhiều lần và duy trì xử lý tương thích với đơn hàng cũ sử dụng `Product.stock`.

### 2.6. Tích hợp Payment

Khi thanh toán thất bại, hệ thống chuyển Order sang `PAYMENT_FAILED` và hoàn nguyên liệu trong Transaction.

Đơn thanh toán thất bại phải chuyển lại `PENDING` và giữ nguyên liệu thành công trước khi thực hiện thanh toán lại.

Việc hoàn thiện trải nghiệm retry Payment trên frontend và Integration Test Payment toàn luồng được phối hợp với Task 8.

### 2.7. Hiển thị số ly có thể pha

Nâng cấp hai API:

- `GET /products`
- `GET /products/:id`

Bổ sung trường `availableBySize` để tính số ly khả dụng theo `DEFAULT`, `S`, `M`, `L`.

Số ly được xác định bằng nguyên liệu có khả năng đáp ứng ít ly nhất trong công thức:

**Available = MIN(FLOOR(Ingredient.stock / RecipeItem.quantity))**

Trường `stock` trong API Response được tính theo công thức `DEFAULT`, không ghi đè `Product.stock` trong database.

API chỉ tính công thức cơ bản, chưa bao gồm topping được khách lựa chọn. Khi tạo Order, backend luôn kiểm tra tồn kho lại trong Transaction.

### 2.8. Đồng bộ quy trình Seed

Tạo chương trình `prisma/seed-all.ts` để khởi tạo toàn bộ dữ liệu bằng một lệnh:

`npx prisma db seed`

Thứ tự thực hiện:

1. `seed.ts`: tạo 10 Product.
2. `seed-ingredients.ts`: tạo 12 Ingredient.
3. `seed-recipes.ts`: tạo 100 RecipeItem.
4. `seed-toppings.ts`: tạo 3 ToppingRecipe.
5. Kiểm tra số lượng dữ liệu và công thức theo size.

Cấu hình lệnh Seed trong `prisma.config.ts`.

Các chương trình Seed sử dụng `upsert` nhằm tránh tạo dữ liệu trùng. Phần Seed nguyên liệu không đặt lại `stock` đã tồn tại. Các dữ liệu mẫu chỉ sử dụng trong môi trường phát triển/kiểm thử.

## 3. Quy trình thực hiện Task 10.3

**Bước 1 – Thiết kế database**

Cập nhật `prisma/schema.prisma`, bổ sung Ingredient, RecipeItem, ToppingRecipe, OrderIngredient và các quan hệ cần thiết với Product, Order.

**Bước 2 – Migration**

Tạo Migration `20261027080217_ingredient_inventory`, áp dụng lên PostgreSQL và cập nhật Prisma Client.

**Bước 3 – Khởi tạo dữ liệu**

Xây dựng chương trình Seed sản phẩm, nguyên liệu, công thức và topping.

**Bước 4 – Xây dựng nghiệp vụ tồn kho**

Triển khai `src/orders/ingredient-stock.ts` để tính, giữ và hoàn nguyên liệu.

**Bước 5 – Tích hợp OrdersService**

Điều chỉnh chức năng tạo Order, hủy Order, xử lý Transaction và lưu lịch sử nguyên liệu.

**Bước 6 – Tích hợp PaymentsService**

Bổ sung xử lý hoàn nguyên liệu khi thanh toán thất bại và cơ chế giữ lại nguyên liệu khi thử thanh toán lại.

**Bước 7 – Nâng cấp ProductsService**

Tính số ly khả dụng dựa trên Ingredient và Recipe theo từng size.

**Bước 8 – Kiểm thử**

Viết và chạy Unit Test, Integration Test và kiểm tra các request đặt hàng đồng thời.

**Bước 9 – Hoàn thiện Seed tổng hợp**

Tạo `seed-all.ts`, cấu hình Prisma, kiểm tra dữ liệu sau Seed và chạy Seed lại để xác nhận không tạo bản ghi trùng.

## 4. Kết quả kiểm thử

### 4.1. Unit Test và Integration Test

Kết quả của lần chạy toàn bộ Jest gần nhất:

- Test Suites: **7/7 PASS**.
- Tests: **40/40 PASS**.
- NestJS Build: **PASS**.

Các bài kiểm thử bao gồm:

- Logic Order State Machine.
- Tạo đơn, hủy đơn và hoàn nguyên liệu.
- Transaction và rollback.
- Optimistic Locking khi đặt hàng đồng thời.
- Xử lý Payment.
- Tính số ly khả dụng trong ProductsService.

### 4.2. Integration Test đặt hàng đồng thời

Thử nghiệm 5 request đặt hàng đồng thời trên PostgreSQL, với tồn kho 100 g và mỗi request cần 80 g nguyên liệu.

Kết quả:

| Chỉ số | Giá trị |
|---|---:|
| Request đồng thời | 5 |
| Request thành công | 1 |
| Request thất bại | 4 |
| Order được tạo | 1 |
| Tồn kho ban đầu | 100 g |
| Tồn kho sau kiểm thử | 20 g |
| Ingredient version cuối | 1 |

Kết quả xác nhận hệ thống không bán vượt tồn kho trong kịch bản kiểm thử.

### 4.3. Kết quả Seed

Đã chạy thành công `npx prisma db seed` nhiều lần trên database phát triển.

| Loại dữ liệu | Số lượng |
|---|---:|
| Product | 10 |
| Ingredient | 12 |
| RecipeItem | 100 |
| ToppingRecipe | 3 |

Chương trình xuất thông báo `SEED ALL COMPLETED SUCCESSFULLY`.

Số lượng bản ghi không tăng sau khi chạy lại. Việc đối chiếu độc lập giá trị stock/version trước và sau Seed vẫn là bước kiểm tra bổ sung được khuyến nghị.

## 5. Hướng dẫn chạy trên máy thành viên khác

Yêu cầu: Node.js, PostgreSQL và file `.env` chứa `DATABASE_URL` hợp lệ.

Tại thư mục `backend`, chạy theo thứ tự:

1. `npm install`
2. `npx prisma migrate deploy`
3. `npx prisma generate`
4. `npx prisma db seed`
5. `npm run build`
6. `npm test -- --runInBand`
7. `npm run start:dev`

Chỉ chạy Seed dữ liệu minh họa trên database phát triển hoặc kiểm thử. Các bài Integration Test có tạo và dọn dữ liệu thật nên không chạy trên database production.

## 6. Các file chính

| File | Vai trò |
|---|---|
| `prisma/schema.prisma` | Schema các bảng Inventory |
| `prisma/migrations/20261027080217_ingredient_inventory/` | Migration PostgreSQL |
| `prisma/seed-all.ts` | Điều phối các chương trình Seed |
| `prisma/seed-ingredients.ts` | Seed nguyên liệu |
| `prisma/seed-recipes.ts` | Seed công thức |
| `prisma/seed-toppings.ts` | Seed topping |
| `src/orders/ingredient-stock.ts` | Tính, giữ và hoàn nguyên liệu |
| `src/orders/orders.service.ts` | Tích hợp tồn kho vào Order |
| `src/payments/payments.service.ts` | Xử lý tồn kho khi thanh toán |
| `src/products/products.service.ts` | Tính số ly khả dụng |
| `src/products/products.service.spec.ts` | Unit Test ProductsService |
| `test/stock-concurrency.integration.ts` | Kiểm thử đặt hàng đồng thời |

Ngoài ra, thư mục `prisma/` chứa các chương trình `check-ingredient-*` và `check-order-*` phục vụ kiểm tra nghiệp vụ trực tiếp với PostgreSQL.

## 7. Giới hạn và hướng mở rộng

- Công thức pha chế hiện sử dụng định lượng minh họa.
- Chưa xây dựng API quản trị nhập thêm nguyên liệu.
- Chưa có cảnh báo tồn kho nguyên liệu sắp hết.
- Frontend cần tích hợp trường `availableBySize`.
- Cần phối hợp Task 8 để kiểm thử tích hợp toàn bộ quy trình thanh toán thất bại, giữ lại nguyên liệu và thanh toán thành công.
- Chưa triển khai hệ thống phân quyền CUSTOMER/STAFF/ADMIN vì không phải yêu cầu bắt buộc riêng của Task 10.3.
- Việc giữ kho đồng thời đã được kiểm chứng trong kịch bản kiểm thử nhưng chưa thay thế cho kiểm thử tải và đánh giá mọi tình huống cạnh tranh trong môi trường vận hành.

## 8. Kết luận

Task 10.3 đã triển khai các yêu cầu cốt lõi về **Transaction, Optimistic Locking và ngăn đặt hàng vượt tồn kho**.

Hệ thống được mở rộng để quản lý tồn kho nguyên vật liệu theo công thức pha chế, size và topping; tích hợp Order, Payment, API Products và quy trình Seed tổng hợp.

Các kết quả kiểm thử đã ghi nhận cho thấy nghiệp vụ tồn kho hoạt động đúng trong những kịch bản được kiểm tra, tạo cơ sở để nhóm tiếp tục tích hợp và review trước khi merge vào `develop`.