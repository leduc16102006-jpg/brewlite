# BrewLite — Task 8: Mock Payment Backend

> **Phạm vi:** hướng dẫn chạy backend và kiểm thử API thanh toán giả lập của Assignment 1. Đây là tài liệu riêng cho Task 8, không thay thế README chung do nhóm phụ trách.
>
> **Kết quả kiểm thử đã ghi nhận ngày 16/10/2026:** Jest **10/10 PASS**, NestJS `npm run build` **PASS**, thanh toán WALLET/CARD thành công và trường hợp `PAYMENT_FAILED` đã được xác nhận trong PostgreSQL.

## 1. Giới thiệu

BrewLite là ứng dụng đặt và thanh toán đồ uống. Task 8 triển khai **`POST /payments`**, hỗ trợ hai phương thức thanh toán giả lập:

- `WALLET`: ví điện tử giả lập.
- `CARD`: thẻ giả lập.

Kết quả xử lý đơn hàng:

- Gateway trả thành công → Order chuyển sang `PAID`.
- Gateway trả thất bại → Order chuyển sang `PAYMENT_FAILED`.

**Không có giao dịch tiền thật.** Task 8 tích hợp với Task 6 (`POST /orders`, tạo Order `PENDING`) và Task 7 (JWT).

## 2. Công nghệ và thư mục liên quan

- **Backend:** NestJS, TypeScript, Node.js.
- **Cơ sở dữ liệu:** PostgreSQL 17, Prisma ORM / Prisma Client **6.19.3** trong môi trường đã kiểm thử.
- **Môi trường phát triển:** Windows PowerShell, Docker Desktop, Swagger, Jest.

```text
brewlite/
├── backend/
│   ├── .env                         # Cấu hình cục bộ — KHÔNG commit
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts                  # 10 sản phẩm mẫu, stock=20 khi tạo mới
│   ├── src/
│   │   ├── auth/                    # Task 7: đăng nhập, JWT
│   │   ├── orders/                  # Task 6: tạo đơn hàng
│   │   ├── payments/                # Task 8
│   │   │   ├── dto/create-payment.dto.ts
│   │   │   ├── mock-payment.gateway.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.controller.spec.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── payments.service.spec.ts
│   │   │   └── payments.module.ts
│   │   └── app.module.ts
│   └── prisma.config.ts
└── README.md                         # README chung của nhóm (không ghi đè)
```

## 3. Chuẩn bị môi trường

Cần có Node.js và npm tương thích với dự án, Docker Desktop đang hoạt động, và source code BrewLite. Chạy các lệnh dưới đây tại thư mục **`brewlite/backend`**:

```powershell
cd D:\app-ban-cafe\Projects\brewlite\backend
npm install
```

Tạo/cập nhật file **`backend/.env`** bằng thông tin của môi trường phát triển. Dưới đây chỉ là **mẫu**, cần thay tên người dùng, mật khẩu và JWT secret bằng giá trị riêng; không sao chép mật khẩu thật vào tài liệu:

```dotenv
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/brewlite_db?schema=public"
JWT_SECRET="<a-long-private-secret>"
```

Nếu ứng dụng yêu cầu biến môi trường khác, tham khảo cấu hình hiện có của dự án. Không commit `.env`, JWT hoặc mật khẩu.

### 3.1. Khởi động PostgreSQL

Trong môi trường đã kiểm thử, Docker container có tên **`brewlite-postgres`**, image `postgres:17`, port máy chủ `127.0.0.1:5432`.

```powershell
docker ps
```

Nếu container đã tồn tại nhưng đang dừng:

```powershell
docker start brewlite-postgres
```

**Lưu ý:** Đây là thao tác với container đã tồn tại trên máy đã kiểm thử. Khi thiết lập máy mới, cần dùng cấu hình PostgreSQL/Docker Compose do nhóm cung cấp; không tự giả định cùng tên container hoặc mật khẩu.

### 3.2. Đồng bộ Prisma và database

```powershell
npx prisma generate
npx prisma migrate status
```

Nếu `migrate status` báo migration còn thiếu trong **database phát triển**, xem lại migration trước khi chạy:

```powershell
npx prisma migrate deploy
npx prisma migrate status
```

Môi trường đã kiểm thử có migration Task 6: `20261015153543_add_products_orders`, và kết quả cuối cùng là `Database schema is up to date!`.

### 3.3. Thêm dữ liệu sản phẩm mẫu (nếu cần)

File `prisma/seed.ts` từ Task 6 chứa 10 sản phẩm ID 1–10; mỗi sản phẩm **được tạo mới** với tồn kho 20. Script dùng `upsert`: khi sản phẩm đã tồn tại, cập nhật tên/giá/ảnh nhưng **không reset stock**.

Trước tiên kiểm tra bảng `Product`. Nếu chưa có dữ liệu, sử dụng cách chạy TypeScript phù hợp với dependencies của nhóm, ví dụ nếu `tsx` đã sẵn có:

```powershell
npx tsx prisma/seed.ts
```

Kết quả mong đợi: `Seeded 10 BrewLite products`. Nếu `npx` hỏi cài `tsx`, xác nhận cách quản lý dependencies với nhóm trước khi chấp nhận cài thêm.

> `GET /products` có thể hiển thị sản phẩm trong khi bảng `Product` của PostgreSQL vẫn rỗng; hãy kiểm tra database nếu `POST /orders` trả 404.

## 4. Chạy Backend và Swagger

```powershell
npm run start:dev
```

- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

API liên quan:

| API | Mục đích | JWT |
|---|---|---|
| `POST /auth/register` | Tạo tài khoản | Không |
| `POST /auth/login` | Đăng nhập lấy JWT | Không |
| `GET /products` | Xem sản phẩm | Theo cấu hình hiện tại |
| `POST /orders` | Tạo đơn hàng `PENDING` | Có |
| `POST /payments` | Thanh toán Mock WALLET/CARD | Có |

Đăng nhập qua Swagger, lấy access token rồi nhấn **Authorize** và dùng Bearer JWT cho Orders/Payments. **Không đưa JWT vào README hoặc ảnh công khai.**

## 5. Hướng dẫn kiểm thử thủ công

### 5.1. Tạo Order

Chọn **POST /orders** trong Swagger, gửi ví dụ:

```json
{
  "items": [
    { "productId": 1, "qty": 1, "size": "M" },
    { "productId": 2, "qty": 1, "size": "M" }
  ]
}
```

Với dữ liệu seed trên môi trường đã thử: Americano 39.000đ + Latte 55.000đ = **94.000đ**. Khi tạo thành công, API trả HTTP 201, Order `PENDING`, `id` của đơn hàng và các OrderItems. Tồn kho hai sản phẩm giảm từ 20 xuống 19 trong bài kiểm thử đã thực hiện.

### 5.2. Thanh toán thành công (WALLET hoặc CARD)

Chọn **POST /payments**, thay `orderId` bằng ID **đơn hàng mới tạo**:

```json
{
  "orderId": 1,
  "method": "WALLET"
}
```

Hoặc dùng `"method": "CARD"` với đơn hàng `PENDING` **khác**. Với Mock Gateway mặc định trả về `PAID`, phản hồi ví dụ:

```json
{
  "orderId": 1,
  "method": "WALLET",
  "status": "PAID",
  "message": "Thanh toán giả lập thành công"
}
```

**Không thanh toán lại đơn đã `PAID`**: Service từ chối trạng thái không hợp lệ.

### 5.3. Kiểm tra trạng thái trong PostgreSQL

Trong PowerShell trên máy thử nghiệm:

```powershell
docker exec -it brewlite-postgres psql -U brewlite -d brewlite_db
```

Trong `psql`:

```sql
SELECT id, "userId", status, total
FROM "Order"
ORDER BY id;
```

Để thoát: `\q`.

Kết quả đã được xác nhận từ phiên kiểm thử ngày 16/10/2026:

| Order ID | Kịch bản | Total | Status trong PostgreSQL |
|---|---|---:|---|
| 1 | WALLET thành công | 94.000 | `PAID` |
| 2 | CARD thành công | 55.000 | `PAID` |
| 3 | WALLET giả lập thất bại | 45.000 | `PAYMENT_FAILED` |

ID ở bảng trên là dữ liệu kiểm thử lịch sử, **không phải ID cố định** cho máy khác.

### 5.4. Kiểm thử nhánh thất bại

Gateway mặc định trả `PAID` trong `src/payments/mock-payment.gateway.ts`. Khi cần kiểm thử trực tiếp, trên **môi trường phát triển riêng** có thể tạm thời đổi giá trị trả về của `charge()` sang `PAYMENT_FAILED`, tạo một đơn `PENDING` mới, gọi `POST /payments` và xác nhận trong PostgreSQL, rồi **khôi phục `return 'PAID'` trước khi commit**.

Nhánh lỗi cũng được kiểm thử bằng Jest thông qua `mockGateway.charge.mockResolvedValue('PAYMENT_FAILED')`, không cần ghi dữ liệu thật trong unit test.

## 6. Quy tắc xử lý thanh toán hiện tại

`PaymentsController` được bảo vệ bởi `JwtAuthGuard`. `PaymentsService`:

1. Nhận `userId` từ JWT và `orderId`, `method` từ request body.
2. Tìm Order trong PostgreSQL; không có Order → `404`.
3. So sánh `order.userId` với user hiện tại; không khớp → `403`.
4. Chỉ cho xử lý khi trạng thái Order là `PENDING` hoặc `PAYMENT_FAILED` (cho phép thử lại).
5. Gọi `MockPaymentGateway.charge(method)`.
6. Dùng Prisma `order.updateMany({ where: { id, status: previousStatus }, data: { status } })` để cập nhật có điều kiện. Nếu không cập nhật được bản ghi nào, trả lỗi thay vì báo thành công.

**Giới hạn:** cập nhật có điều kiện không thay thế Idempotency-Key của Task 10.2; chưa có bản ghi `Payment` riêng trong schema Task 6. Cơ chế hoàn tồn kho khi thanh toán thất bại cần thống nhất với nhóm; chưa được xác nhận là đã triển khai.

---------------------------------------------------------------------

## Cập nhật: Lưu lịch sử giao dịch Payment

### 1. Database

Bổ sung model Payment trong Prisma với các trường:

- id: Mã giao dịch
- orderId: Mã đơn hàng
- amount: Số tiền thanh toán
- method: WALLET hoặc CARD
- status: PAID hoặc PAYMENT_FAILED
- idempotencyKey: Trường tùy chọn, dành cho Task 10.2
- createdAt: Thời gian tạo giao dịch

Payment có quan hệ với Order.

### 2. Migration

Migration đã tạo:

20261017173842_add_payment_history

Để áp dụng các migration đã commit trên môi trường phát triển:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Xử lý thanh toán

POST /payments thực hiện:

1. Xác thực JWT.
2. Kiểm tra đơn hàng tồn tại.
3. Kiểm tra quyền sở hữu đơn hàng.
4. Kiểm tra trạng thái đơn hàng.
5. Thực hiện Mock Payment bằng WALLET/CARD.
6. Cập nhật Order và tạo Payment trong cùng
   Prisma database transaction.
7. Trả về kết quả thanh toán.

### 4. Kiểm thử

- WALLET -> PAID: PASS
- CARD -> PAID: PASS
- PAYMENT_FAILED: PASS (Unit Test)
- Lưu WALLET/PAID vào PostgreSQL: PASS
- Jest: 10/10 PASS
- NestJS Build: PASS

### 5. Giới hạn hiện tại

- Chưa triển khai xử lý Idempotency-Key.
- Chưa chống xử lý lặp yêu cầu thanh toán.
- Các chức năng trên sẽ được hoàn thiện ở Task 10.2.
- Mock Gateway không xử lý tiền thật.
