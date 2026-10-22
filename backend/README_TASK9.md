# BrewLite — Task 9: Order Confirmation & History

## 1. Nội dung đã làm

- Bổ sung **`GET /orders/me`** để người dùng đã đăng nhập xem lịch sử đơn hàng của chính mình, sắp xếp đơn mới nhất trước.
- Bổ sung **`GET /orders/:id`** để lấy chi tiết đơn hàng (trạng thái, tổng tiền, thời gian, danh sách sản phẩm), phục vụ màn hình xác nhận đơn hàng.
- Sử dụng **JWT Guard** từ Task 7; lấy `userId` từ tài khoản đang đăng nhập.
- Chỉ cho xem chi tiết đơn hàng khi **ID đơn hàng và `userId` cùng khớp**; trả về `404` nếu không tìm thấy hoặc không thuộc người dùng.
- Tái sử dụng `OrdersController`, `OrdersService` và PostgreSQL/Prisma của Task 6; giữ nguyên API `POST /orders`.
- Bổ sung `orders.service.spec.ts` và `orders.controller.spec.ts` để kiểm thử tự động.

**Phạm vi:** Đây là phần **backend API** của Task 9. Giao diện xác nhận đơn hàng và các công việc triển khai/demo chung của nhóm không nằm trong phần code này.

## 2. Kết quả thực hiện

| Kiểm tra | Kết quả |
| --- | --- |
| `GET /orders/me` trả lịch sử đơn hàng từ PostgreSQL | PASS |
| `GET /orders/:id` trả chi tiết đơn hàng | PASS (`200`) |
| Không gửi JWT | PASS (`401`) |
| ID không phải số (`abc`) | PASS (`400`) |
| Order không tồn tại | PASS (`404`) |
| Truy cập Order của tài khoản khác | PASS (`404`) |
| Unit Test `OrdersService` | **5/5 PASS** |
| Unit Test `OrdersController` | **4/4 PASS** |
| Jest toàn backend | **19/19 PASS**, 5/5 test suites |
| `npm run build` | **PASS** |

Các kết quả trên được xác nhận bằng Swagger và lệnh kiểm thử trong quá trình phát triển. Các Unit Test sử dụng mock, không ghi dữ liệu vào PostgreSQL.

## 3. Cách chạy và kiểm tra

**Yêu cầu:** Node.js, npm, Docker Desktop, source BrewLite và file `.env` đã cấu hình đúng `DATABASE_URL`, `JWT_SECRET`. Không đưa `.env` lên GitHub.

Mở PowerShell tại thư mục backend:

```powershell
cd D:\app-ban-cafe\Projects\brewlite\backend
npm install
```

Mở Docker Desktop, sau đó kiểm tra PostgreSQL. Với máy đang phát triển BrewLite, container có tên `brewlite-postgres`:

```powershell
docker ps -a
# Chỉ chạy lệnh sau nếu container đang dừng:
docker start brewlite-postgres
```

Kiểm tra database và tạo Prisma Client:

```powershell
npx prisma migrate status
# Chỉ khi có migration chưa được áp dụng trên database phát triển:
npx prisma migrate deploy
npx prisma generate
```

Khởi động NestJS:

```powershell
npm run start:dev
```

Mở Swagger: **http://localhost:3000/api/docs**.

Để kiểm thử API, đăng nhập bằng `POST /auth/login`, lấy JWT, chọn **Authorize** trên Swagger rồi gọi:

- **`GET /orders/me`** — Xem danh sách đơn hàng của tài khoản hiện tại.
- **`GET /orders/1`** — Xem đơn hàng có ID 1 (nếu thuộc tài khoản đăng nhập).

Chạy test và build:

```powershell
npm test -- --runInBand
npm run build
```

Nếu gặp lỗi `P1001` (không kết nối được `localhost:5432`), hãy kiểm tra Docker Desktop, container PostgreSQL và cấu hình `DATABASE_URL`.
