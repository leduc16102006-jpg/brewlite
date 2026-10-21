# BrewLite - Ứng dụng Web Đặt Cà Phê Trực Tuyến Không Dùng Tiền Mặt

Dự án Bài tập lớn môn **Công nghệ Phần mềm** (Software Engineering) - Học kỳ I (Năm học 2026-2027)  
Khoa Công nghệ Thông tin - Trường Đại học Sài Gòn.

---

## 1. Cơ cấu Nhóm & Phân công nhiệm vụ (6 thành viên)

| STT | Thành viên | Vai trò Scrum | Phân công nhiệm vụ & Mã Task phụ trách |
| :---: | :--- | :--- | :--- |
| 1 | **Thành viên A** | Product Owner (PO) | Quản lý Product Backlog; Giao diện Giỏ hàng (Task 5) và Giao diện Thanh toán (Task 8 UI). |
| 2 | **Thành viên B** | Scrum Master / DevOps | Quản lý Monorepo, Docker Compose, Hạ tầng Docker Full-Stack, Tài liệu README, API Lịch sử đơn `GET /orders/me` & Nghiệm thu bàn giao (Task 1, Task 9). |
| 3 | **Thành viên C** | Developer | CSDL danh mục sản phẩm, API `GET /products` (Task 2) và Nghiệp vụ nâng cao: State Machine `assertTransition` (Task 10.1), Thanh toán Idempotent (Task 10.2). |
| 4 | **Thành viên D** | Developer | Giao diện Menu hiển thị dạng lưới (Task 3) và Modal chọn Size/Topping tính giá cộng dồn (Task 4), Giao diện Lịch sử đơn hàng (Task 9 UI). |
| 5 | **Thành viên E** | Developer | Xác thực tài khoản (`POST /auth/register`, `POST /auth/login`, Bcrypt, JWT, `JwtAuthGuard`) (Task 7) và Kiểm soát tồn kho bằng Transaction + Optimistic Locking (Task 10.3). |
| 6 | **Thành viên F** | Developer | API Tạo đơn hàng `POST /orders` (Task 6), API Thanh toán giả lập `POST /payments` (Task 8 BE), API Lịch sử đơn `GET /orders/me` (Task 9 BE) và Khuyến mãi / Điểm thưởng loyalty (Task 10.4). |

---

## 2. Kiến trúc & Ngăn xếp Công nghệ (Tech Stack)

Hệ thống được tổ chức theo mô hình Monorepo gồm 2 phân hệ độc lập:
- **Frontend (`/frontend`)**: Next.js 14+ (App Router), TypeScript, TailwindCSS, Axios / Fetch API, Zustand / React Context quản lý giỏ hàng.
- **Backend (`/backend`)**: NestJS, TypeScript, Kiến trúc Module chuẩn, OpenAPI Swagger UI tài liệu hóa API, Passport-JWT, class-validator.
- **Cơ sở dữ liệu (Database)**: PostgreSQL 16/17 chạy trong Docker container độc lập, quản lý lược đồ và truy vấn qua Prisma ORM.
- **Quy trình phát triển**: Tuân thủ Agile/Scrum, GitFlow (`main`, `develop`, `feature/*`), và quy chuẩn Definition of Done (DoD).

---

## 3. Danh sách Tính năng & API đã hoàn thành (100% Đã kiểm thử)

Tài liệu Swagger tương tác trực tiếp tại: `http://localhost:3000/api/docs`

| Phân hệ / Task | Nền tảng / Phương thức | Endpoint / Route | Xác thực | Mô tả chi tiết & Nghiệp vụ | Người thực hiện |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Task 2: Sản phẩm** | Backend (`GET`) | `/products` | Public | Lấy danh sách toàn bộ menu đồ uống (id, tên, giá, ảnh, số lượng tồn kho từ PostgreSQL). | Bạn C |
| | Backend (`GET`) | `/products/:id` | Public | Lấy thông tin chi tiết của một sản phẩm theo ID. | Bạn C |
| **Task 3: Giao diện Menu** | Frontend (Next.js) | `/` (Trang chủ) | Public | Hiển thị menu đồ uống dạng lưới (Grid), tích hợp thanh tìm kiếm, bộ lọc danh mục theo tab, có trạng thái Loading và Empty state. | Bạn D |
| **Task 4: Chi tiết & Tùy chọn** | Frontend (Next.js) | Modal Chi tiết | Public | Modal tùy chỉnh món: chọn Size (S/M/L), chọn Topping (Trân châu, Extra shot, Kem cheese), tự động tính và cộng dồn giá theo thời gian thực. | Bạn D |
| **Task 7: Xác thực** | Backend (`POST`) | `/auth/register` | Public | Đăng ký tài khoản người dùng mới (Mật khẩu được băm an toàn qua Bcrypt). | Bạn E |
| | Backend (`POST`) | `/auth/login` | Public | Đăng nhập hệ thống, kiểm tra mật khẩu và trả về chuỗi `accessToken` (JWT). | Bạn E |
| | Backend (`GET`) | `/auth/me` | Bearer JWT | Trích xuất thông tin người dùng từ token (Bảo vệ bởi `JwtAuthGuard`). | Bạn E |
| **Task 6: Đơn hàng** | Backend (`POST`) | `/orders` | Bearer JWT | Tạo đơn hàng mới (`PENDING`), validate dữ liệu qua `class-validator`, trừ tồn kho đồng thời trong Transaction, tính tổng tiền trên máy chủ. | Bạn F |
| **Task 8: Thanh toán** | Backend (`POST`) | `/payments` | Bearer JWT | Thanh toán giả lập qua Ví (`WALLET`) hoặc Thẻ (`CARD`). Cập nhật đơn hàng sang `PAID` hoặc `PAYMENT_FAILED` và lưu lịch sử giao dịch vào bảng `Payment`. | Bạn F |
| **Task 9: Lịch sử đơn hàng** | Backend (`GET`) | `/orders/me` | Bearer JWT | Lấy danh sách lịch sử đơn hàng của tài khoản đang đăng nhập, sắp xếp mới nhất lên đầu, kèm thông tin chi tiết từng món. | Bạn F |
| | Backend (`GET`) | `/orders/:id` | Bearer JWT | Xem chi tiết một đơn hàng cụ thể theo ID (chỉ xem được đơn của chính mình, chặn tài khoản khác). | Bạn F |
| **Task 10.1: Máy trạng thái** | Backend (`PATCH`) | `/orders/:id/status` | Bearer JWT | Chuyển đổi trạng thái đơn hàng theo sơ đồ State Machine (`PENDING -> PAID -> PREPARING -> READY -> COMPLETED`). Chặn chuyển trạng thái sai (lỗi `400 Bad Request`) và tự động hoàn kho khi hủy đơn. Unit test: 14/14 PASS. | Bạn C |
| **Task 10.2: Thanh toán Idempotent** | Backend (`POST`) | `/payments` | Bearer JWT + Header `idempotency-key` | Chống trừ tiền và nhân đôi đơn hàng khi khách bấm thanh toán nhiều lần. Dùng trạng thái `PROCESSING` và kiểm tra khóa duy nhất trên PostgreSQL. Trả về kết quả cũ nếu gửi lại cùng key. Unit test: 11/11 PASS. | Bạn C |
| **Task 10.3: Khóa lạc quan tồn kho** | Backend (`POST`) | `/orders` | Bearer JWT | Kiểm soát đồng thời bằng Database Transaction và trường `version` (Optimistic Locking). Đảm bảo nhiều khách đặt cùng lúc khi chỉ còn 1 ly thì chỉ 1 đơn thành công, tồn kho không bao giờ bị âm. Concurrency test: PASS. | Bạn E |

---

## 4. Hướng dẫn Khởi chạy Hệ thống

### KỊCH BẢN A: Dành cho Giảng viên nghiệm thu / Demo sản phẩm (Docker 1 chạm)
Không cần cài đặt Node.js hay mở nhiều terminal, chỉ cần bật Docker Desktop và chạy lệnh:
```bash
docker compose up --build -d
Sau khi terminal báo [+] up 3/3, mở trình duyệt truy cập:

Giao diện Người dùng (Frontend Next.js): http://localhost:3001

Tài liệu API (Swagger UI NestJS): http://localhost:3000/api/docs

Lưu ý khi tạo database lần đầu: Nạp nhanh 10 món cà phê mẫu bằng lệnh:
- docker exec -it brewlite_backend npx prisma db seed
Tắt hệ thống sau khi demo: docker compose down

KỊCH BẢN B: Dành cho Thành viên nhóm clone về để code tiếp (Development Mode)
Để có tính năng tự động tải lại trang khi sửa code (Hot Reload), các bạn không chạy Frontend/Backend trong Docker mà chạy ngoài máy thật theo các bước sau:

Bước 1: Kéo code và tạo nhánh làm việc mới
git checkout develop
git pull origin develop
git checkout -b feature/<ten-task-cua-ban>
Bước 2: Bật Database PostgreSQL ngầm (Docker)
Tại thư mục gốc dự án:

docker compose up -d postgres

Bước 3: Khởi chạy Backend (Terminal 1)
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev

Backend chạy tại http://localhost:3000 (Swagger: http://localhost:3000/api/docs).


Bước 4: Khởi chạy Frontend (Terminal 2)
cd frontend
npm install
copy .env.example .env.local
npm run dev

Giao diện mở tại http://localhost:3001, sửa code là web tự đổi ngay lập tức.

5. Hướng dẫn mở Trình quản trị CSDL trực quan (Prisma Studio)
Để theo dõi dữ liệu các bảng Product, Order, Payment, mở một terminal mới tại thư mục backend và gõ:

npx prisma studio

Truy cập: http://localhost:5555

6. Chạy Toàn bộ Kiểm thử Tự động (Backend Tests - 6/6 Suites PASS)
Tại thư mục backend, chạy lệnh duy nhất:

npm test

Hệ thống sẽ chạy qua toàn bộ 6 test suites (bao gồm State Machine, Idempotent và Stock Concurrency Test), trả về kết quả xanh 6 passed, 6 total | 30 passed, 30 total.