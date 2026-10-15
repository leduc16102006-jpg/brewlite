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

5. Quy định làm việc nhóm trên Git (BẮT BUỘC)
Nhánh main: Chỉ chứa mã nguồn ổn định nhất dùng để nghiệm thu và nộp bài. Không ai được commit trực tiếp vào main.

Nhánh develop: Nhánh tích hợp chung của nhóm. Tất cả tính năng sau khi test đạt sẽ được tạo Pull Request (PR) gộp vào đây.

Quy trình làm task mới:

Cập nhật nhánh mới nhất: git checkout develop && git pull origin develop

Tạo nhánh tính năng riêng: git checkout -b feature/<tên-task>

Sau khi hoàn thành và test đạt DoD, đẩy nhánh lên GitHub và tạo Pull Request vào nhánh develop.


---
