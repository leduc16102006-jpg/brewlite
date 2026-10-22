# BrewLite - Ứng dụng Web Đặt Cà Phê Trực Tuyến Không Dùng Tiền Mặt

Dự án Bài tập lớn môn **Công nghệ Phần mềm** (Software Engineering) - Học kỳ I (Năm học 2026-2027)  
Khoa Công nghệ Thông tin - Trường Đại học Sài Gòn.

---

## 1. Cơ cấu Nhóm & Phân công nhiệm vụ (6 thành viên)

| STT | Thành viên | Vai trò Scrum | Phân công nhiệm vụ & Mã Task phụ trách |
| :---: | :--- | :--- | :--- |
| 1 | **Thành viên A** | Product Owner (PO) | Quản lý Product Backlog; Giao diện Giỏ hàng (Task 5) và Giao diện Thanh toán (Task 8 UI). |
| 2 | **Thành viên B** | Scrum Master / DevOps | Quản lý Monorepo, Docker Compose, Hạ tầng Docker Full-Stack, Tài liệu README, API Lịch sử đơn `GET /orders/me` & Nghiệm thu bàn giao (Task 1, Task 9). |
| 3 | **Thành viên C** | Developer | CSDL danh mục sản phẩm, API `GET /products` (Task 2) và Nghiệp vụ nâng cao: State Machine `assertTransition` (Task 10.1), Thanh toán Idempotent (Task 10.2), Khuyến mãi & Điểm thưởng loyalty (Task 10.4). |
| 4 | **Thành viên D** | Developer | Giao diện Menu hiển thị dạng lưới (Task 3) và Modal chọn Size/Topping tính giá cộng dồn (Task 4), Giao diện Lịch sử đơn hàng (Task 9 UI). |
| 5 | **Thành viên E** | Developer | Xác thực tài khoản (`POST /auth/register`, `POST /auth/login`, Bcrypt, JWT, `JwtAuthGuard`) (Task 7) và Kiểm soát tồn kho bằng Transaction + Optimistic Locking (Task 10.3). |
| 6 | **Thành viên F** | Developer | API Tạo đơn hàng `POST /orders` (Task 6), API Thanh toán giả lập `POST /payments` (Task 8 BE), API Lịch sử đơn `GET /orders/me` (Task 9 BE). |

---

## 2. Kiến trúc & Ngăn xếp Công nghệ (Tech Stack)

Hệ thống được tổ chức theo mô hình Monorepo gồm 2 phân hệ độc lập:
- **Frontend (`/frontend`)**: Next.js 14+ (App Router), TypeScript, TailwindCSS, Axios / Fetch API, Zustand quản lý giỏ hàng.
- **Backend (`/backend`)**: NestJS, TypeScript, Kiến trúc Module chuẩn, OpenAPI Swagger UI tài liệu hóa API, Passport-JWT, class-validator, Prisma ORM.
- **Cơ sở dữ liệu (Database)**: PostgreSQL 16/17 chạy trong Docker container độc lập.
- **Quy trình phát triển**: Tuân thủ Agile/Scrum, GitFlow (`main`, `develop`, `feature/*`), và quy chuẩn Definition of Done (DoD).

---

## 3. Danh sách Tính năng & API Backend đã hoàn thành (100% Đã kiểm thử)

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
| **Task 6: Đơn hàng** | Backend (`POST`) | `/orders` | Bearer JWT | Tạo đơn hàng mới (`PENDING`), validate dữ liệu qua `class-validator`, trừ tồn kho đồng thời trong Transaction, hỗ trợ đặt cùng món khác kích cỡ. | Bạn E |
| **Task 8: Thanh toán** | Backend (`POST`) | `/payments` | Bearer JWT | Thanh toán giả lập qua Ví (`WALLET`) hoặc Thẻ (`CARD`). Cập nhật đơn hàng sang `PAID` hoặc `PAYMENT_FAILED` và lưu lịch sử giao dịch vào bảng `Payment`. | Bạn E |
| **Task 9: Lịch sử đơn hàng** | Backend (`GET`) | `/orders/me` | Bearer JWT | Lấy danh sách lịch sử đơn hàng của tài khoản đang đăng nhập, sắp xếp mới nhất lên đầu, kèm thông tin chi tiết từng món. | Bạn E |
| | Backend (`GET`) | `/orders/:id` | Bearer JWT | Xem chi tiết một đơn hàng cụ thể theo ID (chỉ xem được đơn của chính mình, chặn tài khoản khác). | Bạn F |
| **Task 10.1: Máy trạng thái** | Backend (`PATCH`) | `/orders/:id/status` | Bearer JWT | Chuyển đổi trạng thái đơn hàng theo sơ đồ State Machine (`PENDING -> PAID -> PREPARING -> READY -> COMPLETED`). Chặn chuyển trạng thái sai (lỗi `400 Bad Request`) và tự động hoàn kho khi hủy đơn. Unit test: 14/14 PASS. | Bạn C |
| **Task 10.2: Thanh toán Idempotent** | Backend (`POST`) | `/payments` | Bearer JWT + Header `idempotency-key` | Chống trừ tiền và nhân đôi đơn hàng khi khách bấm thanh toán nhiều lần. Dùng trạng thái `PROCESSING` và kiểm tra khóa duy nhất trên PostgreSQL. Trả về kết quả cũ nếu gửi lại cùng key. Unit test: 11/11 PASS. | Bạn C |
| **Task 10.3: Khóa lạc quan tồn kho** | Backend (`POST`) | `/orders` | Bearer JWT | Kiểm soát đồng thời bằng Database Transaction và trường `version` (Optimistic Locking). Đảm bảo nhiều khách đặt cùng lúc khi chỉ còn 1 ly thì chỉ 1 đơn thành công, tồn kho không bao giờ bị âm. Concurrency test: PASS. | Bạn E |
| **Task 10.4: Khuyến mãi & Loyalty** | Backend (`POST`) | `/orders`, `/payments` | Bearer JWT | Áp dụng mã giảm giá hợp lệ (`PERCENT` hoặc `FIXED`), kiểm tra thời hạn và điều kiện đơn tối thiểu. Tự động cộng điểm thưởng vào bảng `LoyaltyTransaction` khi đơn hàng chuyển sang `PAID`. | Bạn C |

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


```
### HƯỚNG DẪN KIỂM THỬ & NGHIỆM THU CHI TIẾT TỪNG TASK (DEFINITION OF DONE)



Tất cả các API được kiểm thử trực tiếp tại **Swagger UI**:  
👉 [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

> **Lưu ý quan trọng:**  
> Trước khi thực hiện các task cần xác thực, đăng nhập qua `POST /auth/login` để lấy Token, sau đó bấm nút **Authorize** ở góc trên bên phải và dán:  
> `Bearer <token>`

---

## Task 1: Thiết lập Monorepo & Môi trường phát triển

**Người phụ trách:** Thành viên B (Scrum Master / DevOps)

### Tiêu chí nghiệm thu
1. Cấu trúc thư mục chia tách rõ ràng: `/frontend` (Next.js) và `/backend` (NestJS).
2. Tệp `docker-compose.yml` tại thư mục gốc quản lý được container PostgreSQL, có mạng nội bộ và volume lưu trữ bền vững.

### Cách chạy & kiểm tra
```bash
# Kiểm tra trạng thái container DB
docker compose up -d postgres
docker ps

Kết quả mong đợi:

Container brewlite_postgres hiển thị trạng thái Up tại cổng 5432

Task 2: API Quản lý Danh mục Sản phẩm & Tồn khoNgười phụ trách: Thành viên CTiêu chí nghiệm thuLấy danh sách sản phẩm và chi tiết sản phẩm kèm số lượng tồn kho từ PostgreSQL.Cách chạy & kiểm tra
Gọi GET /products
→ Trả về mã 200 OK kèm mảng 10 món cà phê từ CSDL (tên, giá, ảnh, tồn kho stock).
Gọi GET /products/1
→ Trả về thông tin chi tiết của riêng sản phẩm ID 1 (ví dụ: Americano).
Gọi GET /products/99999
→ Trả về mã 404 Not Found (Sản phẩm không tồn tại).

Task 3: Giao diện Menu Sản phẩm dạng lưới (Grid)Người phụ trách: Thành viên DTiêu chí nghiệm thuHiển thị danh mục món dạng lưới responsive, có bộ lọc tab và thanh tìm kiếm món ăn.Cách chạy & kiểm tra
Mở trình duyệt vào http://localhost:3001.
Gõ chữ "Latte" vào ô tìm kiếm → Danh sách tự động lọc ra món Latte.
Bấm vào các tab phân loại (Cà phê pha phin, Cà phê máy) → Danh sách sản phẩm thay đổi tương ứng.

Task 4: Giao diện Modal Tùy chỉnh (Size, Topping, Tính giá)Người phụ trách: Thành viên DTiêu chí nghiệm thuBấm vào món hiển thị popup tùy chỉnh: chọn Size (S/M/L), chọn Topping, tự động tính tổng tiền theo thời gian thực.Cách chạy & kiểm tra
Tại trang chủ http://localhost:3001, bấm vào nút "+ Thêm món" tại sản phẩm "Cà phê Sữa đá".
Chọn Size L → Giá tiền hiển thị tự động cộng thêm 10.000đ.
Tích chọn thêm Topping "Kem cheese" → Giá tiền cộng thêm 10.000đ.
Tăng số lượng lên 2 → Tổng tiền tạm tính tự động nhân đôi chính xác trước khi bấm thêm vào giỏ.


Task 5: Quản lý Trạng thái Giỏ hàng (Cart Store)Người phụ trách: Thành viên ATiêu chí nghiệm thuQuản lý giỏ hàng bằng Zustand Store toàn cục, lưu vào LocalStorage, chuyển trang không mất giỏ hàng.Cách chạy & kiểm tra
Chọn 1 món từ trang chủ, bấm xác nhận đưa vào giỏ hàng.
Biểu tượng Giỏ hàng trên thanh Header cập nhật số lượng (Badge số lượng).
Chuyển sang trang /checkout → Danh sách món, kích cỡ, topping và tổng tiền vẫn được giữ nguyên vẹn.
Thao tác nút tăng + / giảm - số lượng hoặc nút "Xóa" → Tổng tiền giỏ hàng cập nhật tự động.

Task 6: API Tạo Đơn hàng & Trừ Tồn kho (Database Transaction)Người phụ trách: Thành viên FTiêu chí nghiệm thu
Validate dữ liệu DTO
Trừ kho đồng thời bằng transaction
Hỗ trợ đặt cùng món khác size
Tự động tính tổng tiền trên server
Cách chạy & kiểm tra trên SwaggerGọi POST /orders với payload mẫu:

{
  "items": [
    { "productId": 1, "qty": 1, "size": "M" },
    { "productId": 1, "qty": 1, "size": "L" }
  ]
}

Kết quả mong đợi:
Trả về mã 201 Created, trạng thái đơn là PENDING.
Mở Prisma Studio → Số lượng stock của sản phẩm 1 trong bảng Product tự động giảm đi đúng 2 ly.

Task 7: Xác thực Người dùng (Auth JWT & Bcrypt)Người phụ trách: Thành viên ETiêu chí nghiệm thu
Đăng ký băm mật khẩu bằng Bcrypt
Đăng nhập cấp JWT Token
Bảo vệ endpoint bằng JwtAuthGuard
Cách chạy & kiểm tra1. Gọi POST /auth/register:
{
  "email": "testuser@gmail.com",
  "fullName": "Nguyen Van A",
  "password": "Password123@"
}

→ Trả về mã 201 Created. Trong CSDL mật khẩu được băm (hash), không lưu văn bản thuần.2. Gọi POST /auth/login với tài khoản trên

→ Trả về chuỗi accessToken (JWT).3. Gọi GET /auth/me khi chưa dán Token

→ Bị chặn với mã lỗi 401 Unauthorized.4. Gắn Token vào nút Authorize rồi gọi lại GET /auth/me

→ Trả về thông tin cá nhân thành công.


Task 8: Thanh toán Giả lập & Lưu Lịch sử Giao dịchNgười phụ trách: Thành viên F (Backend) & Thành viên A (UI)Tiêu chí nghiệm thuTiếp nhận phương thức WALLET hoặc CARD, chuyển trạng thái đơn sang PAID, lưu bản ghi thanh toán vào bảng Payment.Cách chạy & kiểm tra
Lấy mã orderId của một đơn hàng đang PENDING.
Gọi POST /payments:

{
  "orderId": 1,
  "method": "WALLET"
}

Kết quả: Trả về mã 200/201 OK, đơn hàng chuyển sang trạng thái PAID.
Kiểm tra Prisma Studio → Bảng Payment xuất hiện dòng giao dịch mới gắn với orderId: 1.


Task 9: Lịch sử Đơn hàng, Xác nhận Đơn & Đóng gói DockerNgười phụ trách: Thành viên B (DevOps, API) & Thành viên D (UI)Tiêu chí nghiệm thu
API xem lịch sử đơn của user hiện tại
Bảo mật phân quyền đơn
Dockerfile chuẩn hóa
Chạy Full-stack 3 dịch vụ
Cách chạy & kiểm tra

1. Gọi GET /orders/me

→ Trả về mã 200 OK kèm danh sách toàn bộ các đơn của tài khoản đang đăng nhập, sắp xếp mới nhất lên đầu.

2. Gọi GET /orders/1
Nếu đơn thuộc sở hữu của user → Trả về chi tiết đơn hàng.
Nếu đơn của user khác → Trả về lỗi 404 Not Found (Bảo mật quyền sở hữu đơn).

3. Kiểm tra Docker Full-Stack:

docker compose up --build -d
→ Hệ thống tự dựng cả 3 container không báo lỗi.

Task 10.1: Máy trạng thái Đơn hàng (Order State Machine)
Người phụ trách: Thành viên CTiêu chí nghiệm thu (Tiêu chí chấm a)
Chặn đổi trạng thái sai; tự động hoàn kho khi đơn bị hủy hoặc lỗi thanh toán.

1. Cách chạy & kiểm tra1. Chạy Unit Test tự động (14 bài test):

npm test -- orders.service.spec.ts

2. Kiểm tra trên Swagger qua PATCH /orders/:id/status:
Đổi hợp lệ: PAID → PREPARING → READY → COMPLETED (Thành công).
Cố tình nhảy cóc: Đơn đang PENDING mà gửi chuyển sang COMPLETED → Nhận mã lỗi 400 Bad Request.
Chuyển PENDING → CANCELLED → Kiểm tra CSDL thấy số lượng tồn kho tự động được cộng trả lại.

Task 10.2: Thanh toán Idempotent (Chống trừ tiền trùng lặp)
Người phụ trách: Thành viên C
Tiêu chí nghiệm thu (Tiêu chí chấm b)
Sử dụng Header idempotency-key. Gửi 2 lần cùng key chỉ thực hiện 1 lần giao dịch, không trừ tiền 2 lần.Cách chạy & kiểm tra1. Chạy Unit Test tự động (11 bài test):

npm test -- payments.service.spec.ts
→ Kết quả: 11 passed, 11 total.

2. Kiểm tra trên Swagger qua POST /payments:
Lần 1: Điền Header idempotency-key: KEY-TEST-01, gọi thanh toán đơn 1 → Thành công 200/201.
Lần 2: Giữ nguyên idempotency-key: KEY-TEST-01, bấm Execute lần nữa → Server trả về kết quả cũ, cổng thanh toán không bị gọi lại lần 2.
Mở CSDL → Bảng Payment chỉ có duy nhất 1 bản ghi mang key KEY-TEST-01.

Task 10.3: Kiểm soát Tồn kho khi Đặt đồng thời (Optimistic Locking):

Người phụ trách: Thành viên ETiêu chí nghiệm thu (Tiêu chí chấm c)
Sử dụng trường version và Database Transaction. Khi nhiều luồng cùng đặt 1 ly cuối cùng, chỉ 1 đơn thành công, tồn kho không bao giờ bị âm.Cách chạy & kiểm tra
1. Chạy Concurrency Integration Test:
npm test -- stock-concurrency.integration.ts

2. Kết quả terminal in ra:
Số request gửi đồng thời: 5
Số đơn tạo thành công: 1
Số đơn bị từ chối: 4
Tồn kho sau cùng: 0 (Tuyệt đối không bị âm)
Cột version trong CSDL tăng thêm 1.

Task 10.4: Khuyến mãi & Tích lũy Điểm thưởng (Loyalty)
Người phụ trách: Thành viên C
Tiêu chí nghiệm thu
- Áp mã giảm giá hợp lệ (PERCENT hoặc FIXED)
- Kiểm tra hạn dùng và đơn tối thiểu
- Tự động cộng điểm thưởng vào bảng LoyaltyTransaction khi đơn hàng PAID

Cách chạy & kiểm tra
Tạo mã giảm giá mẫu trong bảng Promotion trên Prisma Studio
(Code: BREW10, loại PERCENT, giá trị 10%, đơn tối thiểu 30000).
Gọi POST /orders có kèm "promotionCode": "BREW10"
→ Trả về mã 201 Created, tổng tiền total được chiết khấu đúng 10%.
Gọi POST /payments thanh toán cho đơn hàng trên
→ Sau khi đơn chuyển sang PAID, mở bảng LoyaltyTransaction trên Prisma Studio: Xuất hiện dòng cộng điểm mới tương ứng với công thức total / 10000.
 
5. Chạy Toàn bộ Kiểm thử Tự động (Backend Test Suite)
Để kiểm tra toàn diện tất cả các tiêu chí chấm điểm kỹ thuật tự động của đề tài, tại thư mục backend, chạy lệnh duy nhất:
Bash
npm test
Kết quả chuẩn xác:textTest Suites: 6 passed, 6 total
Tests:       30 passed, 30 total(Vượt qua 100% các tiêu chí a, b, c)
```