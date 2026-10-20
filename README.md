# BrewLite - Ứng dụng Web Đặt Cà Phê Trực Tuyến Không Dùng Tiền Mặt

Dự án Bài tập lớn môn **Công nghệ Phần mềm** (Software Engineering) - Học kỳ I (Năm học 2026-2027)  
Khoa Công nghệ Thông tin - Trường Đại học Sài Gòn.

---

## 1. Cơ cấu Nhóm & Phân công nhiệm vụ (6 thành viên)

| STT | Thành viên | Vai trò Scrum | Phân công nhiệm vụ & Mã Task phụ trách |
| :---: | :--- | :--- | :--- |
| 1 | **Thành viên A** | Product Owner (PO) | Quản lý Product Backlog; Giao diện Giỏ hàng (Task 5) và Giao diện Thanh toán (Task 8 UI). |
| 2 | **Thành viên B** | Scrum Master / DevOps | Quản lý Monorepo, Docker Compose, Tài liệu README, Hướng dẫn môi trường, API Lịch sử đơn `GET /orders/me` & Nghiệm thu bàn giao (Task 1, Task 9). |
| 3 | **Thành viên C** | Developer | CSDL danh mục sản phẩm, API `GET /products` (Task 2) và Nghiệp vụ nâng cao: State Machine `assertTransition` (Task 10.1), Thanh toán Idempotent (Task 10.2). |
| 4 | **Thành viên D** | Developer | Giao diện Menu hiển thị dạng lưới (Task 3) và Modal chọn Size/Topping tính giá cộng dồn (Task 4). |
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

## 3. Danh sách Tính năng & API đã hoàn thành (Đã kiểm thử)

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
| **Task 6: Đơn hàng** | Backend (`POST`) | `/orders` | Bearer JWT | Tạo đơn hàng mới (`PENDING`), validate dữ liệu qua `class-validator`, trừ tồn kho đồng thời trong Transaction, tính tổng tiền trên máy chủ. | Bạn E |
| **Task 8: Thanh toán** | Backend (`POST`) | `/payments` | Bearer JWT | Thanh toán giả lập qua Ví (`WALLET`) hoặc Thẻ (`CARD`). Cập nhật đơn hàng sang `PAID` hoặc `PAYMENT_FAILED` và lưu lịch sử giao dịch vào bảng `Payment`. *(Xem chi tiết tại `backend/README_TASK8.md`)* | Bạn E |
| **Task 9: Lịch sử đơn hàng** | Backend (`GET`) | `/orders/me` | Bearer JWT | Lấy danh sách lịch sử đơn hàng của tài khoản đang đăng nhập, sắp xếp mới nhất lên đầu, kèm thông tin chi tiết từng món. *(Xem chi tiết tại `backend/README_TASK9.md`)* | Bạn E |
| | Backend (`GET`) | `/orders/:id` | Bearer JWT | Xem chi tiết một đơn hàng cụ thể theo ID (chỉ xem được đơn của chính mình, chặn tài khoản khác). | Bạn E |
| **Task 10.1: Máy trạng thái** | Backend (`PATCH`) | `/orders/:id/status` | Bearer JWT | Chuyển đổi trạng thái đơn hàng theo sơ đồ State Machine (`PENDING -> PAID -> PREPARING -> READY -> COMPLETED`). Chặn chuyển trạng thái sai (lỗi `400 Bad Request`) và tự động hoàn kho khi hủy đơn. Unit test: 14/14 PASS. | Bạn C |
| **Task 10.2: Thanh toán Idempotent** | Backend (`POST`) | `/payments` | Bearer JWT + Header `idempotency-key` | Chống trừ tiền và nhân đôi đơn hàng khi khách bấm thanh toán nhiều lần. Dùng trạng thái `PROCESSING` và kiểm tra khóa duy nhất trên PostgreSQL. Trả về kết quả cũ nếu gửi lại cùng key. Unit test: 11/11 PASS. | Bạn C |

---

## 4. Hướng dẫn Cài đặt & Khởi chạy Nhanh (Sử dụng Docker Full-Stack)

Để dễ dàng nghiệm thu và chạy thử toàn bộ hệ thống (Database + Backend + Frontend) mà không cần cấu hình phức tạp, nhóm đã đóng gói dự án bằng Docker (Task 9).

### Yêu cầu duy nhất
- Đã cài đặt và đang bật ứng dụng **Docker Desktop** trên máy tính (biểu tượng Engine báo màu xanh lá cây).

### Khởi chạy 1 chạm (One-click Start)
Mở terminal tại thư mục gốc của dự án (`brewlite`) và chạy lệnh duy nhất sau:
```bash
docker compose up --build -d

Quá trình tải và build sẽ diễn ra khoảng 1-2 phút cho lần đầu tiên. Sau khi terminal báo [+] up 3/3, hệ thống đã sẵn sàng:

Giao diện Người dùng (Frontend Next.js): http://localhost:3001

Tài liệu API (Swagger UI NestJS): http://localhost:3000/api/docs

Lưu ý: Nếu muốn tắt hệ thống, gõ lệnh docker compose down.

5. Quy trình Kiểm thử luồng Nghiệp vụ (End-to-End Test qua Swagger)
Mở Swagger UI tại: http://localhost:3000/api/docs.

Dùng POST /auth/login để lấy accessToken, sau đó gắn vào nút Authorize ở góc trên bên phải theo cú pháp Bearer <accessToken>.

Dùng POST /orders tạo đơn hàng mới với giỏ hàng mẫu:

{
  "items": [
    { "productId": 1, "qty": 1, "size": "M" },
    { "productId": 2, "qty": 2, "size": "L" }
  ]
}

// có thể lấy cái khác cũng được 

Lấy mã id của đơn hàng vừa tạo trong kết quả trả về (ví dụ: id: 1).

Dùng POST /payments để thực hiện thanh toán Idempotent (Task 8 & 10.2):

Header idempotency-key: Nhập chuỗi duy nhất, ví dụ PAY-KEY-001.

Body:

{
  "orderId": 1,
  "method": "WALLET"
}

Bấm Execute lần 1: Đơn hàng chuyển sang PAID và lưu lịch sử giao dịch vào bảng Payment.

Bấm Execute lần 2 (cùng key và body): Hệ thống trả về kết quả thành công cũ mà không gọi lại cổng thanh toán, không trừ tiền và không nhân đôi giao dịch trong CSDL.

Dùng PATCH /orders/:id/status để kiểm tra máy trạng thái (Task 10.1):

Đổi trạng thái hợp lệ sang PREPARING hoặc READY.

Cố tình gửi trạng thái sai (ví dụ từ PREPARING lùi về PENDING) để kiểm tra mã lỗi 400 Bad Request chặn chuyển tiếp không hợp lệ.

Dùng GET /orders/me để kiểm tra Lịch sử đơn hàng (Task 9):

Bấm Execute: Hệ thống trả về danh sách toàn bộ các đơn hàng của user đang đăng nhập kèm trạng thái chi tiết từng món.

Dùng GET /orders/1 để xem chi tiết riêng đơn hàng số 1.

6. Chạy Kiểm thử Tự động (Unit Test Backend)
Nếu muốn chạy test nội bộ trên máy phát triển (yêu cầu cài sẵn Node.js), tại thư mục backend, chạy lệnh:

# Chạy toàn bộ các bài unit test
npm test

# Chạy riêng kiểm thử máy trạng thái Task 10.1 (14/14 PASS)
npm test -- orders.service.spec.ts

# Chạy riêng kiểm thử thanh toán Idempotent Task 10.2 (11/11 PASS)
npm test -- payments.service.spec.ts

# Chạy riêng kiểm thử Controller Task 9 (4/4 PASS)
npm test -- orders.controller.spec.ts

