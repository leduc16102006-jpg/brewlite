# BrewLite - Coffee Ordering App

Dự án bài tập lớn môn Công nghệ Phần mềm - Học kỳ I (2026-2027)
Khoa Công nghệ Thông tin - Trường Đại học Sài Gòn.

---

## 1. Thành viên nhóm (6 thành viên)
- **Thành viên A**: Product Owner / Giỏ hàng & Thanh toán (Frontend)
- **Thành viên B**: Scrum Master / DevOps, Lịch sử đơn & Bàn giao
- **Thành viên C**: Developer / CSDL, Danh mục sản phẩm & State Machine
- **Thành viên D**: Developer / Giao diện Menu & Chi tiết sản phẩm
- **Thành viên E**: Developer / Xác thực tài khoản (JWT) & Tồn kho đồng thời
- **Thành viên F**: Developer / Đơn hàng, Thanh toán Idempotent & Điểm thưởng

---

## 2. Công nghệ sử dụng
- **Frontend**: Next.js 14+ (TypeScript, TailwindCSS, App Router)
- **Backend**: NestJS (TypeScript, REST API, Swagger OAS 3.0)
- **Database & ORM**: PostgreSQL 16 (chạy qua Docker Compose) kết hợp Prisma ORM
- **Bảo mật & Validation**: Bcrypt (băm mật khẩu), Passport-JWT (xác thực token), class-validator
- **Hạ tầng & Quản lý mã nguồn**: Docker Compose, Git (GitFlow: `main`, `develop`, `feature/*`)

---

## 3. Danh sách API đã hoàn thành (Tính đến hiện tại)

Tài liệu Swagger tương tác trực tiếp tại: `http://localhost:3000/api/docs`

| Nhóm chức năng | Phương thức | Endpoint | Mô tả / Tiêu chí | Người phụ trách |
| :--- | :---: | :--- | :--- | :---: |
| **Sản phẩm (Task 2)** | `GET` | `/products` | Trả về danh sách menu đồ uống (id, tên, giá, ảnh) | Bạn C |
| | `GET` | `/products/:id` | Trả về chi tiết món kèm tùy chọn | Bạn C |
| **Xác thực (Task 7)** | `POST` | `/auth/register` | Đăng ký tài khoản (mật khẩu băm qua bcrypt) | Bạn E |
| | `POST` | `/auth/login` | Đăng nhập và nhận chuỗi JWT AccessToken | Bạn E |
| | `GET` | `/auth/me` | Lấy thông tin cá nhân (Bảo vệ bởi `JwtAuthGuard`) | Bạn E |

---

## 4. Hướng dẫn cài đặt và Khởi chạy hệ thống (Local)

### Yêu cầu môi trường
- Đã cài đặt **Node.js** (phiên bản 20+ hoặc 22+)
- Đã cài đặt và đang bật ứng dụng **Docker Desktop** trên máy tính

---

### BƯỚC 1: Khởi động Cơ sở dữ liệu PostgreSQL (qua Docker)
Đứng tại thư mục gốc `brewlite`, mở terminal và chạy đúng một lệnh duy nhất:
bash ( terminal):

docker compose up -d

### BƯỚC 2: Khởi chạy Backend (NestJS)
Mở terminal và di chuyển vào thư mục backend:

cd backend
npm install
cp .env.example .env    # Trên Windows PowerShell dùng: copy .env.example .env
npx prisma generate
npx prisma db push
npm run start:dev

Backend chạy tại: http://localhost:3000

Tài liệu Swagger UI: http://localhost:3000/api/docs

### BƯỚC 3: Khởi chạy Frontend (Next.js)
Mở một cửa sổ terminal mới và di chuyển vào thư mục frontend:

cd frontend
npm install
cp .env.example .env.local    # Trên Windows PowerShell dùng: copy .env.example .env.local
npm run dev

Frontend chạy tại: http://localhost:3001 (hoặc http://localhost:3000)

# Task 6 – Orders API

1. Mô tả:
Xây dựng API tạo đơn hàng cho hệ thống BrewLite bằng NestJS và Prisma ORM. API cho phép người dùng đã đăng nhập tạo đơn hàng từ danh sách sản phẩm.

2. API Endpoint:
POST/orders: tạo đơn hàng mới/JWT Bearer Token

3. Request Headers:
Content-Type: application/json
Authorization: Bearer <access_token>

4. Request Body:
{
  "items": [
    {
      "productId": 1,
      "qty": 2,
      "size": "M"
    }
  ]
}
Trong đó:
    productId: ID sản phẩm cần đặt.
    qty: Số lượng sản phẩm, phải lớn hơn hoặc bằng 1.
    size: Kích cỡ sản phẩm, không bắt buộc.

5. Xử lý nghiệp vụ:
    Xác thực người dùng bằng JWT.
    Kiểm tra tài khoản và sự tồn tại của sản phẩm.
    Kiểm tra số lượng tồn kho.
    Tính tổng tiền dựa trên giá sản phẩm trong cơ sở dữ liệu.
    Cập nhật tồn kho sau khi đặt hàng.
    Lưu thông tin đơn hàng và các sản phẩm thuộc đơn hàng.
    Sử dụng Prisma transaction để đảm bảo các thao tác liên quan được xử lý đồng bộ.

6. Response thành công:
Ví dụ minh họa cấu trúc phản hồi; dữ liệu thực tế phụ thuộc vào cơ sở dữ liệu.
{
  "id": 1,
  "userId": 1,
  "status": "PENDING",
  "total": 78000,
  "items": [
    {
      "productId": 1,
      "qty": 2,
      "lineTotal": 78000
    }
  ]
}

7. Các trường hợp lỗi:
400 Bad Request: Dữ liệu đầu vào không hợp lệ hoặc không đủ tồn kho
401 Unauthorized: Thiếu JWT hoặc token không hợp lệ
404 Not Found: Sản phẩm không tồn tại

8. Cách kiểm thử:
    1 Khởi động PostgreSQL và cấu hình DATABASE_URL trong file .env.

    2 Chạy backend bằng npm run start:dev.

    3 Mở Swagger tại http://localhost:3000/api/docs.

    4 Đăng ký hoặc đăng nhập để lấy access token.

    5 Nhấn Authorize và nhập token theo hướng dẫn của Swagger.

    6 Gọi POST /orders với request body hợp lệ.

    7 Kiểm tra kết quả trả về và xác nhận dữ liệu đơn hàng, chi tiết đơn hàng, tồn kho trong cơ sở dữ liệu.

**file seed.ts nap du lieu vao postgreSQL de POST/orders: xem bang product tai: npx prisma studio**
    cd backend
    npx prisma migrate status
    npx prisma studio

