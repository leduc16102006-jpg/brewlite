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

## 3. Danh sách Tính năng & API đã hoàn thành (Đã kiểm thử)


Tài liệu Swagger tương tác trực tiếp tại: `http://localhost:3000/api/docs`

| Phân hệ / Task | Nền tảng / Phương thức | Endpoint / Tuyến | Xác thực | Mô tả chi tiết & Nghiệp vụ | Người thực hiện |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Task 2: Sản phẩm** | Backend (`GET`) | `/products` | Public | Lấy danh sách toàn bộ menu đồ uống (id, tên, giá, ảnh, số lượng tồn kho từ PostgreSQL). | Bạn C |
| | Backend (`GET`) | `/products/:id` | Public | Lấy thông tin chi tiết của một sản phẩm theo ID. | Bạn C |
| **Task 3: Giao diện Menu** | Frontend (Next.js) | `/` (Trang chủ) | Public | Hiển thị menu đồ uống dạng lưới (Grid), tích hợp thanh tìm kiếm, bộ lọc danh mục theo tab, có trạng thái Loading và Empty state. | Bạn D |
| **Task 4: Chi tiết & Tùy chọn** | Frontend (Next.js) | Modal Chi tiết | Public | Modal tùy chỉnh món: chọn Size (S/M/L), chọn Topping (Trân châu, Extra shot, Kem cheese), tự động tính và cộng dồn giá theo thời gian thực. | Bạn D |
| **Task 7: Xác thực** | Backend (`POST`) | `/auth/register` | Public | Đăng ký tài khoản người dùng mới (Mật khẩu được băm an toàn qua Bcrypt). | Bạn E |
| | Backend (`POST`) | `/auth/login` | Public | Đăng nhập hệ thống, kiểm tra mật khẩu và trả về chuỗi `accessToken` (JWT). | Bạn E |
| | Backend (`GET`) | `/auth/me` | Bearer JWT | Trích xuất thông tin người dùng từ token (Bảo vệ bởi `JwtAuthGuard`). | Bạn E |
| **Task 6: Đơn hàng** | Backend (`POST`) | `/orders` | Bearer JWT | Tạo đơn hàng mới (`PENDING`), validate dữ liệu qua `class-validator`, trừ tồn kho đồng thời trong Transaction, tính tổng tiền trên máy chủ. | Bạn F |
| **Task 8: Thanh toán** | Backend (`POST`) | `/payments` | Bearer JWT | Thanh toán giả lập qua Ví (`WALLET`) hoặc Thẻ (`CARD`). Tự động cập nhật đơn hàng sang `PAID` hoặc `PAYMENT_FAILED` và lưu lịch sử giao dịch vào bảng `Payment`. *(Chi tiết xem thêm tại `backend/README_TASK8.md`)* | Bạn F |
| **Task 10.1: Máy trạng thái** | Backend (`PATCH`) | `/orders/:id/status` | Bearer JWT | Chuyển đổi trạng thái đơn hàng theo sơ đồ State Machine (`PENDING -> PAID -> PREPARING -> READY -> COMPLETED`). Chặn các chuyển tiếp không hợp lệ và tự động hoàn kho khi hủy đơn hoặc thanh toán lỗi. Unit test: 14/14 PASS. | Bạn C |

Tài liệu Swagger tương tác trực tiếp cho Backend tại: `http://localhost:3000/api/docs`

| Phân hệ / Task | Nền tảng / Phương thức | Endpoint / Route | Xác thực | Mô tả chi tiết & Nghiệp vụ | Người thực hiện |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Task 2: Sản phẩm** | Backend (`GET`) | `/products` | Public | Lấy danh sách toàn bộ menu đồ uống (id, tên, giá, ảnh, số lượng tồn kho từ CSDL PostgreSQL). | Bạn C |
| | Backend (`GET`) | `/products/:id` | Public | Lấy thông tin chi tiết của một sản phẩm theo ID. | Bạn C |
| **Task 3: Giao diện Menu** | Frontend (Next.js) | `/` (Trang chủ) | Public | Hiển thị menu đồ uống dạng lưới (Grid), tích hợp thanh tìm kiếm, bộ lọc danh mục theo tab, có trạng thái Loading và Empty state. | Bạn D |
| **Task 4: Chi tiết & Tùy chọn** | Frontend (Next.js) | Modal Chi tiết | Public | Modal tùy chỉnh món: chọn Size (S/M/L), chọn Topping (Trân châu, Extra shot, Kem cheese), tự động tính và hiển thị giá cộng dồn theo thời gian thực. | Bạn D |
| **Task 7: Xác thực** | Backend (`POST`) | `/auth/register` | Public | Đăng ký tài khoản người dùng mới (Mật khẩu được băm an toàn qua Bcrypt). | Bạn E |
| | Backend (`POST`) | `/auth/login` | Public | Đăng nhập hệ thống, kiểm tra mật khẩu và trả về chuỗi `accessToken` (JWT). | Bạn E |
| | Backend (`GET`) | `/auth/me` | Bearer JWT | Trích xuất thông tin người dùng từ token (Bảo vệ bởi `JwtAuthGuard`). | Bạn E |
| **Task 6: Đơn hàng** | Backend (`POST`) | `/orders` | Bearer JWT | Tạo đơn hàng mới (`PENDING`), validate dữ liệu đầu vào qua `class-validator`, trừ tồn kho đồng thời trong Transaction, tự tính tổng tiền trên máy chủ. | Bạn E |
| **Task 8: Thanh toán** | Backend (`POST`) | `/payments` | Bearer JWT | Thanh toán giả lập qua Ví (`WALLET`) hoặc Thẻ (`CARD`). Tự động cập nhật đơn hàng sang `PAID` hoặc `PAYMENT_FAILED` và lưu lịch sử giao dịch vào bảng `Payment`. *(Chi tiết xem thêm tại `backend/README_TASK8.md`)* | Bạn E |


---

## 4. Hướng dẫn Cài đặt & Khởi chạy Toàn diện cho Thành viên mới

### Yêu cầu môi trường tối thiểu
- Đã cài đặt **Node.js** (phiên bản 20 LTS hoặc 22 LTS).

- Đã cài đặt và đang bật ứng dụng **Docker Desktop** trên máy tính (biểu tượng Engine báo màu xanh lá cây).

- Đã cài đặt và đang bật ứng dụng **Docker Desktop** trên máy tính.


---

### BƯỚC 1: Khởi chạy Cơ sở dữ liệu PostgreSQL (Docker)

Tại thư mục gốc của dự án (`brewlite`), mở terminal và chạy:

Tại thư mục gốc dự án (`brewlite`), mở terminal và chạy:

```bash
docker compose up -d
Kiểm tra: Gõ lệnh docker ps, nếu thấy container brewlite_postgres đang chạy trên cổng 5432 là hoàn tất.


Kiểm tra: Gõ lệnh docker ps, nếu thấy container brewlite_postgres đang chạy trên cổng 5432 là hoàn tất.


BƯỚC 2: Cài đặt và Khởi chạy Backend (NestJS)
Mở một cửa sổ terminal mới và thực hiện tuần tự:


### BƯỚC 2: Cài đặt và Khởi chạy Backend (NestJS)
Mở một cửa sổ terminal mới và thực hiện tuần tự:
>>>>>>> origin/develop
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


- Địa chỉ Backend API: http://localhost:3000



* Địa chỉ Backend API: http://localhost:3000


--------------------------- Trình quản lý CSDL trực quan (Prisma Studio):---------------------
npx prisma studio
# Truy cập tại: http://localhost:5555

BƯỚC 3: Cài đặt và Khởi chạy Frontend (Next.js)
Mở một cửa sổ terminal khác và thực hiện:


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


Địa chỉ Frontend: http://localhost:3001 (hoặc http://localhost:3000 nếu cổng 3000 đang dùng cho backend).


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


Đơn hàng chuyển trạng thái sang PAID và lưu lịch sử vào bảng Payment.

Dùng PATCH /orders/:id/status để kiểm tra máy trạng thái (Task 10.1):

Đổi trạng thái hợp lệ sang PREPARING hoặc READY.

Cố tình gửi trạng thái sai (ví dụ từ PREPARING lùi về PENDING) để kiểm tra mã lỗi 400 Bad Request chặn chuyển tiếp không hợp lệ.

6. Chạy Kiểm thử Tự động (Unit Test Backend)
Tại thư mục backend, chạy lệnh:

Bash
# Chạy toàn bộ các bài unit test
npm test

# Chạy riêng kiểm thử máy trạng thái Task 10.1 (14/14 PASS)
npm test -- orders.service.spec.ts

Đơn hàng chuyển trạng thái sang PAID và một bản ghi giao dịch mới được lưu vào bảng Payment.


Task 10.4 – Khuyến mãi và điểm thưởng (Promotion & Loyalty)

  1. Mục tiêu
    Triển khai nghiệp vụ khuyến mãi và điểm thưởng trong hệ thống BrewLite bằng NestJS, Prisma ORM và PostgreSQL. Hệ thống cho phép khách hàng áp dụng mã giảm giá hợp lệ khi tạo đơn hàng và tích lũy điểm sau khi thanh toán thành công.

  2. Chức năng khuyến mãi:
    Hệ thống sử dụng bảng Promotion để lưu thông tin mã giảm giá, bao gồm:  
      code: Mã khuyến mãi duy nhất.
      type: Loại giảm giá (PERCENT hoặc FIXED).
      value: Giá trị giảm giá.
      maxDiscount: Số tiền giảm tối đa, áp dụng cho mã phần trăm.
      minOrderAmount: Giá trị đơn hàng tối thiểu.
      startsAt, expiresAt: Thời gian bắt đầu và hết hạn.
      isActive: Trạng thái hoạt động của mã.
    Khi khách hàng tạo đơn hàng, hệ thống kiểm tra mã khuyến mãi, thời hạn sử dụng, trạng thái hoạt động và giá trị đơn hàng tối thiểu.
    Mã không hợp lệ sẽ bị từ chối. Việc tạo đơn hàng và trừ tồn kho được thực hiện trong transaction để tránh lưu dữ liệu không nhất quán.
    
  3. Quy tắc tính giảm giá
    Hệ thống hỗ trợ hai loại khuyến mãi:
      PERCENT: Giảm theo phần trăm tổng tiền hàng, có thể giới hạn mức giảm tối đa.
      FIXED: Giảm một số tiền cố định, không vượt quá tổng tiền hàng.
    Công thức tính tiền:
      total = subtotal - discountAmount
        subtotal: Tổng tiền hàng trước giảm giá.
        discountAmount: Số tiền được giảm.
        total: Tổng tiền khách hàng phải thanh toán.
    Thông tin khuyến mãi được lưu trong đơn hàng thông qua promotionId, subtotal và discountAmount.

  4. Chức năng điểm thưởng Loyalty
      Hệ thống sử dụng bảng LoyaltyTransaction để lưu lịch sử điểm thưởng của khách hàng.
      Khi đơn hàng chuyển sang trạng thái PAID, hệ thống ghi nhận điểm theo quy tắc:
        Mỗi 10.000 đồng thực trả được 1 điểm, làm tròn xuống.
          Ví dụ: Đơn hàng có tổng tiền sau giảm giá là 36.000 đồng sẽ được cộng 3 điểm.
      Điểm thưởng chỉ được ghi nhận khi thanh toán thành công. Các đơn thanh toán thất bại không được cộng điểm.
      Trường orderId của LoyaltyTransaction có ràng buộc duy nhất để ngăn việc tạo nhiều bản ghi điểm thưởng cho cùng một đơn hàng.

  5. Đảm bảo tính nhất quán dữ liệu
    Các thao tác cập nhật trạng thái đơn hàng, lưu lịch sử thanh toán và ghi nhận điểm thưởng cần được thực hiện trong cùng một transaction.
    Nếu một thao tác thất bại, transaction sẽ rollback để tránh trường hợp đơn hàng đã thanh toán nhưng điểm thưởng chưa được ghi nhận, hoặc điểm thưởng được ghi nhận khi thanh toán không thành công.
    Ràng buộc duy nhất trên LoyaltyTransaction.orderId hỗ trợ chống ghi nhận điểm thưởng trùng lặp.

  6. Kiểm thử
    Tạo đơn với mã khuyến mãi hợp lệ: Đơn hàng được tạo với số tiền giảm chính xác
    Sử dụng mã không tồn tại: Trả về lỗi 400 Bad Request
    Sử dụng mã đã hết hạn hoặc chưa đến ngày bắt đầu: Từ chối áp dụng mã
    Đơn hàng chưa đạt giá trị tối thiểu: Từ chối áp dụng mã
    Thanh toán thành công: Ghi nhận điểm thưởng
    Thanh toán thất bại: Không cộng điểm
    Xử lý ghi nhận điểm cho cùng đơn hàng lần nữa: Không tạo được bản ghi điểm trùng
    Mã giảm giá làm số tiền giảm vượt tổng tiền hàng: Số tiền giảm không vượt quá tổng tiền hàng

  7. SQL kiểm tra dữ liệu
    Kiểm tra các mã khuyến mãi:
      SELECT *
      FROM "Promotion"
      ORDER BY id DESC;
    Kiểm tra đơn hàng và số tiền giảm:
      SELECT
        id,
        subtotal,
        "discountAmount",
        total,
        "promotionId",
        status
      FROM "Order"
      ORDER BY id DESC;
    Kiểm tra lịch sử điểm thưởng:
      SELECT
        id,
        "userId",
        "orderId",
        points,
        "createdAt"
      FROM "LoyaltyTransaction"
      ORDER BY id DESC;
    Kiểm tra có đơn hàng nào bị ghi nhận điểm nhiều lần hay không:
      SELECT
        "orderId",
        COUNT(*) AS transaction_count
      FROM "LoyaltyTransaction"
      GROUP BY "orderId"
      HAVING COUNT(*) > 1;
      Kết quả mong đợi của truy vấn cuối là không có dòng nào.

  8. Kết quả mong đợi
    Áp dụng mã khuyến mãi theo các điều kiện nghiệp vụ đã định nghĩa.
    Tính và lưu chính xác số tiền trước giảm giá, số tiền giảm và số tiền phải thanh toán.
    Chỉ cộng điểm khi đơn hàng thanh toán thành công.
    Ngăn ghi nhận điểm thưởng nhiều lần cho cùng đơn hàng bằng ràng buộc dữ liệu.
    Duy trì tính nhất quán giữa đơn hàng, thanh toán và lịch sử điểm thưởng thông qua transaction.





