# BrewLite - Ứng dụng Web Đặt Cà Phê Trực Tuyến Không Dùng Tiền Mặt

Dự án Bài tập lớn môn **Công nghệ Phần mềm** (Software Engineering) - Học kỳ I (Năm học 2026-2027)  
Khoa Công nghệ Thông tin - Trường Đại học Sài Gòn.

---

## 1. Cơ cấu Nhóm & Phân công nhiệm vụ (6 thành viên)

| STT | Thành viên | Vai trò Scrum | Phân công nhiệm vụ & Mã Task phụ trách |
| :---: | :--- | :--- | :--- |
| 1 | **Thành viên A** | Product Owner (PO) | Quản lý Product Backlog; Giao diện Giỏ hàng (Task 5) và Giao diện Thanh toán (Task 8 UI). |
| 2 | **Thành viên B** | Scrum Master / DevOps | Quản lý Monorepo, Docker Compose, Tài liệu README, Hướng dẫn môi trường, API Lịch sử đơn `GET /orders/me` & Nghiệm thu bàn giao (Task 1, Task 9). |
| 3 | **Thành viên C** | Developer | CSDL danh mục sản phẩm, API `GET /products` (Task 2) và Order State Machine `assertTransition` (Task 10.1, Task 10.2). |
| 4 | **Thành viên D** | Developer | Giao diện Menu hiển thị dạng lưới (Task 3) và Modal chọn Size/Topping tính giá cộng dồn (Task 4). |
| 5 | **Thành viên E** | Developer | Xác thực tài khoản (`POST /auth/register`, `POST /auth/login`, Bcrypt, JWT, `JwtAuthGuard`) (Task 7) và Kiểm soát tồn kho bằng Transaction + Optimistic Locking (Task 10.3). |
| 6 | **Thành viên F** | Developer | API Tạo đơn hàng `POST /orders` (Task 6), API Thanh toán giả lập `POST /payments` (Task 8 BE) và Khuyến mãi / Điểm thưởng loyalty (Task 10.4). |

---

## 2. Kiến trúc & Ngăn xếp Công nghệ (Tech Stack)

Hệ thống được tổ chức theo mô hình Monorepo gồm 2 phân hệ độc lập:
- **Frontend (`/frontend`)**: Next.js 14+ (App Router), TypeScript, TailwindCSS, Axios / Fetch API, Zustand / React Context quản lý giỏ hàng.
- **Backend (`/backend`)**: NestJS, TypeScript, Kiến trúc Module chuẩn, OpenAPI Swagger UI tài liệu hóa API, Passport-JWT, class-validator.
- **Cơ sở dữ liệu (Database)**: PostgreSQL 16/17 chạy trong Docker container độc lập, quản lý lược đồ và truy vấn qua Prisma ORM.
- **Quy trình phát triển**: Tuân thủ Agile/Scrum, GitFlow (`main`, `develop`, `feature/*`), và quy chuẩn Definition of Done (DoD).

---

## 3. Danh sách API Backend đã hoàn thành & Đã kiểm thử

Hệ thống cung cấp tài liệu Swagger tương tác trực tiếp tại: `http://localhost:3000/api/docs`

| Phân hệ | Phương thức | Endpoint | Xác thực | Mô tả chi tiết & Nghiệp vụ | Người thực hiện |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Task 2: Sản phẩm** | `GET` | `/products` | Public | Lấy danh sách toàn bộ menu đồ uống (id, tên, giá, ảnh, số lượng tồn kho). | Bạn C |
| | `GET` | `/products/:id` | Public | Lấy thông tin chi tiết của một sản phẩm theo ID. | Bạn C |
| **Task 7: Xác thực** | `POST` | `/auth/register` | Public | Đăng ký tài khoản mới (Mật khẩu được băm qua Bcrypt). | Bạn E |
| | `POST` | `/auth/login` | Public | Đăng nhập hệ thống, kiểm tra mật khẩu và trả về chuỗi `accessToken` (JWT). | Bạn E |
| | `GET` | `/auth/me` | Bearer JWT | Trích xuất thông tin người dùng từ token (Bảo vệ bởi `JwtAuthGuard`). | Bạn E |
| **Task 6: Đơn hàng** | `POST` | `/orders` | Bearer JWT | Tạo đơn hàng mới (`PENDING`), validate đầu vào qua `class-validator`, trừ tồn kho tự động trong Transaction, tính tổng tiền trên server. | Bạn F |
| **Task 8: Thanh toán** | `POST` | `/payments` | Bearer JWT | Thanh toán giả lập qua Ví (`WALLET`) hoặc Thẻ (`CARD`). Cập nhật đơn hàng sang `PAID` hoặc `PAYMENT_FAILED` và lưu lịch sử giao dịch vào bảng `Payment`. *(Chi tiết xem thêm tại `backend/README_TASK8.md`)* | Bạn F |

---

## 4. Hướng dẫn Cài đặt & Khởi chạy Toàn diện cho Thành viên mới

### Yêu cầu môi trường tối thiểu
- Đã cài đặt **Node.js** (phiên bản 20 LTS hoặc 22 LTS).
- Đã cài đặt và đang bật ứng dụng **Docker Desktop** trên máy tính.

---

### BƯỚC 1: Khởi chạy Cơ sở dữ liệu PostgreSQL (Docker)
Tại thư mục gốc dự án (`brewlite`), mở terminal và chạy:
```bash
docker compose up -d
Kiểm tra: Gõ lệnh docker ps, nếu thấy container brewlite_postgres đang chạy trên cổng 5432 là hoàn tất.

### BƯỚC 2: Cài đặt và Khởi chạy Backend (NestJS)
Mở một cửa sổ terminal mới và thực hiện tuần tự:
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Tạo tệp cấu hình môi trường từ mẫu
# Trên Windows PowerShell:
copy .env.example .env
# Trên macOS / Linux:
# cp .env.example .env

# 4. Sinh Prisma Client và đồng bộ cấu trúc bảng vào CSDL
npx prisma generate
npx prisma db push

# 5. Nạp dữ liệu menu mẫu (10 món đồ uống với tồn kho sẵn sàng)
npx prisma db seed

# 6. Khởi chạy máy chủ backend ở chế độ phát triển
npm run start:dev

* Địa chỉ Backend API: http://localhost:3000

* Tài liệu kiểm thử Swagger UI: http://localhost:3000/api/docs

* Trình quản lý CSDL trực quan (Prisma Studio):
- npx prisma studio
# Truy cập tại: http://localhost:5555

### BƯỚC 3: Cài đặt và Khởi chạy Frontend (Next.js):

# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Tạo tệp cấu hình môi trường frontend
# Trên Windows PowerShell:
copy .env.example .env.local
# Trên macOS / Linux:
# cp .env.example .env.local

# 4. Khởi động giao diện Next.js
npm run dev

Địa chỉ Frontend: http://localhost:3000 (hoặc http://localhost:3001 nếu cổng 3000 đang dùng cho backend).

5. Quy trình Kiểm thử luồng Đặt hàng & Thanh toán (End-to-End)
Mở Swagger UI tại: http://localhost:3000/api/docs.

Dùng POST /auth/login để lấy accessToken, sau đó gắn vào nút Authorize ở góc trên bên phải.

Dùng POST /orders tạo đơn hàng mới với giỏ hàng mẫu:

{
  "items": [
    { "productId": 1, "qty": 1, "size": "M" }
  ]
}

Lấy mã id của đơn hàng vừa tạo trong kết quả trả về (ví dụ: id: 1).

Dùng POST /payments để thực hiện thanh toán cho đơn hàng đó:

{
  "orderId": 1,
  "method": "WALLET"
}

Đơn hàng chuyển trạng thái sang PAID và một bản ghi giao dịch mới được lưu vào bảng Payment.

