# ☕ BrewLite - Ứng dụng Web Đặt Cà Phê Trực Tuyến Không Dùng Tiền Mặt

> **Dự án Bài tập lớn môn Công nghệ Phần mềm (Software Engineering)**  
> **Học kỳ I (Năm học 2026 - 2027)** — Khoa Công nghệ Thông tin, Trường Đại học Sài Gòn.  
> **Repository:** Monorepo (`/frontend` Next.js + `/backend` NestJS + PostgreSQL + Docker).

---

## 📑 Mục lục Điều hướng Nhanh

* [1. Cơ cấu Nhóm & Phân công Nhiệm vụ (6 thành viên)](#1-cơ-cấu-nhóm--phân-công-nhiệm-vụ-6-thành-viên)
* [2. Kiến trúc & Ngăn xếp Công nghệ (Tech Stack)](#2-kiến-trúc--ngăn-xếp-công-nghệ-tech-stack)
* [3. Danh mục Tính năng & Bảng tra cứu API Toàn hệ thống](#3-danh-mục-tính-năng--bảng-tra-cứu-api-toàn-hệ-thống)
* [4. Hướng dẫn Khởi chạy Hệ thống](#4-hướng-dẫn-khởi-chạy-hệ-thống)
  * [4.1. Kịch bản A: Docker 1 chạm (Dành cho Giảng viên nghiệm thu)](#41-kịch-bản-a-docker-1-chạm-dành-cho-giảng-viên-nghiệm-thu)
  * [4.2. Kịch bản B: Chế độ phát triển (Development Mode)](#42-kịch-bản-b-chế-độ-phát-triển-development-mode)
  * [4.3. Quản trị Cơ sở dữ liệu Trực quan (Prisma Studio)](#43-quản-trị-cơ-sở-dữ-liệu-trực-quan-prisma-studio)
* [5. Kịch bản Nghiệm thu End-to-End (E2E Test Flow)](#5-kịch-bản-nghiệm-thu-end-to-end-e2e-test-flow)
* [6. Hướng dẫn Kiểm thử Chi tiết từng Task (Definition of Done)](#6-hướng-dẫn-kiểm-thử-chi-tiết-từng-task-definition-of-done)
  * [Task 1: Thiết lập Monorepo & Môi trường Docker](#task-1-thiết-lập-monorepo--môi-trường-docker)
  * [Task 2: API Quản lý Danh mục Sản phẩm & Tồn kho](#task-2-api-quản-lý-danh-mục-sản-phẩm--tồn-kho)
  * [Task 3: Giao diện Menu Sản phẩm dạng lưới (Grid UI)](#task-3-giao-diện-menu-sản-phẩm-dạng-lưới-grid)
  * [Task 4: Giao diện Modal Tùy chỉnh (Size, Topping, Tính giá)](#task-4-giao-diện-modal-tùy-chỉnh-size-topping-tính-giá)
  * [Task 5: Quản lý Trạng thái Giỏ hàng (Cart Context)](#task-5-quản-lý-trạng-thái-giỏ-hàng-cart-context)
  * [Task 6: API Tạo Đơn hàng & Trừ Tồn kho (Database Transaction)](#task-6-api-tạo-đơn-hàng--trừ-tồn-kho-database-transaction)
  * [Task 7: Xác thực Người dùng (Auth JWT & UI Login)](#task-7-xác-thực-người-dùng-auth-jwt-bcrypt--giao-diện-login)
  * [Task 8: Thanh toán Không tiền mặt & Cổng VNPay Sandbox](#task-8-thanh-toán-không-tiền-mặt--tích-hợp-cổng-vnpay-sandbox)
  * [Task 9: Lịch sử Đơn hàng, Xác nhận Đơn & Đóng gói Docker](#task-9-lịch-sử-đơn-hàng-xác-nhận-đơn--đóng-gói-docker)
  * [Task 10.1: Máy trạng thái Đơn hàng (Order State Machine)](#task-101-máy-trạng-thái-đơn-hàng-order-state-machine)
  * [Task 10.2: Thanh toán Idempotent (Chống trừ tiền trùng lặp)](#task-102-thanh-toán-idempotent-chống-trừ-tiền-trùng-lặp)
  * [Task 10.3: Kiểm soát Tồn kho khi Đặt đồng thời (Optimistic Locking)](#task-103-kiểm-soát-tồn-kho-khi-đặt-đồng-thời-optimistic-locking)
  * [Task 10.4: Khuyến mãi & Tích lũy Điểm thưởng (Loyalty)](#task-104-khuyến-mãi--tích-lũy-điểm-thưởng-loyalty)
* [7. Kiểm thử Tự động Toàn hệ thống (Backend Test Suite)](#7-kiểm-thử-tự-động-toàn-hệ-thống-backend-test-suite)

---

## 1. Cơ cấu Nhóm & Phân công Nhiệm vụ (6 thành viên)

| STT | Thành viên | Vai trò Scrum | Phân công nhiệm vụ & Mã Task phụ trách |
| :---: | :--- | :--- | :--- |
| 1 | **Thành viên A** | Product Owner (PO) | Quản lý Product Backlog; Thiết kế Giao diện Giỏ hàng (Task 5) và Tích hợp lựa chọn Cổng VNPay trên giao diện (Task 8 UI). |
| 2 | **Thành viên B** | Scrum Master / DevOps | Quản lý Monorepo, Cấu hình Docker Compose Full-stack, Tài liệu README, Màn hình Biên nhận `/order-confirmation` và API Lịch sử đơn (Task 1, Task 9). |
| 3 | **Thành viên C** | Developer | API Danh mục `GET /products` (Task 2) và Nghiệp vụ nâng cao: State Machine `assertTransition` (Task 10.1), Thanh toán Idempotent (Task 10.2), Khuyến mãi & Loyalty (Task 10.4). |
| 4 | **Thành viên D** | Developer | Giao diện Menu hiển thị dạng lưới (Task 3) và Modal chọn Size/Topping cộng dồn giá thời gian thực (Task 4), Giao diện Lịch sử đơn hàng (Task 9 UI). |
| 5 | **Thành viên E** | Developer | Xác thực tài khoản (`POST /auth/register`, `POST /auth/login`, Bcrypt, JWT) (Task 7), Khóa tồn kho nguyên liệu Optimistic Locking (Task 10.3), Cổng thanh toán VNPay Sandbox & Webhook IPN (Task 8 BE). |
| 6 | **Thành viên F** | Developer | API Tạo đơn hàng `POST /orders` (Task 6), API Thanh toán nội bộ `POST /payments` (Task 8 BE), Hỗ trợ truy vấn lịch sử đơn hàng (Task 9 BE). |

---

## 2. Kiến trúc & Ngăn xếp Công nghệ (Tech Stack)

Hệ thống được tổ chức theo mô hình **Monorepo** với hai thành phần độc lập: **Frontend Client** và **Backend API Server**.

### 2.1 Frontend (`/frontend`)
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- Fetch API tích hợp Bearer JWT và Idempotency Key
- Context API (`CartContext`) lưu trữ giỏ hàng thông qua `localStorage`

### 2.2 Backend (`/backend`)
- **NestJS 12** Framework
- **TypeScript**
- Kiến trúc Controller - Service - DTO
- OpenAPI Swagger UI (`/api/docs`)
- Passport JWT Authentication (`JwtAuthGuard`)
- `class-validator` và `class-transformer`

### 2.3 Cơ sở dữ liệu & ORM
- **PostgreSQL 16**
- **Prisma ORM 6**
- Prisma Client
- Schema Management
- Transaction Processing
- Seed Data Management

### 2.4 Thanh toán điện tử
- **VNPay Sandbox** Payment Gateway
- SHA-512 Signature Verification
- Asynchronous IPN Callback Processing
- Return URL Validation
- Transaction-safe Order & Payment Update

### 2.5 Hạ tầng & DevOps
- **Docker** & **Docker Compose**
- Multi-container Architecture (Frontend, Backend, PostgreSQL)
- GitFlow Workflow (`main`, `develop`, `feature/*`)
- **Jest** Test Runner

---

## 3. Danh mục Tính năng & Bảng tra cứu API Toàn hệ thống

Tài liệu Swagger UI tương tác trực tiếp tại: **`http://localhost:3000/api/docs`**

| Phân hệ / Task | Nền tảng / Phương thức | Endpoint / Route | Xác thực | Mô tả chi tiết & Nghiệp vụ | Người đảm nhiệm |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Task 2: Sản phẩm** | Backend (`GET`) | `/products` | Public | Lấy danh sách menu đồ uống (id, tên, giá, ảnh, tồn kho từ PostgreSQL). | Bạn C |
| | Backend (`GET`) | `/products/:id` | Public | Lấy thông tin chi tiết của một sản phẩm theo ID. | Bạn C |
| **Task 3: Giao diện Menu** | Frontend (Next.js) | `/` (Trang chủ) | Public | Hiển thị menu đồ uống dạng lưới (Grid), tìm kiếm từ khóa, bộ lọc tab theo danh mục. | Bạn D |
| **Task 4: Chi tiết & Tùy chọn** | Frontend (Next.js) | Modal Chi tiết | Public | Modal tùy chỉnh món: chọn Size (S/M/L), chọn Topping, tính tiền thời gian thực. | Bạn D |
| **Task 5: Giỏ hàng (Cart)** | Frontend (Next.js) | `/cart`, `CartContext` | Client State | Quản lý giỏ hàng toàn cục qua Context API, lưu `localStorage`, Badge nhảy số, tính tổng tiền. | Bạn B (SM) & Bạn A |
| **Task 6: Đơn hàng** | Backend (`POST`) | `/orders` | Bearer JWT | Tạo đơn hàng mới (`PENDING`), validate DTO qua `class-validator`, trừ kho trong Transaction. | Bạn F & Bạn C |
| **Task 7: Xác thực (Auth)** | Backend (`POST`) | `/auth/register` | Public | Đăng ký tài khoản mới (Mật khẩu được băm Bcrypt). | Bạn E |
| | Backend (`POST`) | `/auth/login` | Public | Đăng nhập hệ thống, cấp `accessToken` (JWT). | Bạn E |
| | Backend (`GET`) | `/auth/me` | Bearer JWT | Trích xuất thông tin người dùng từ token (`JwtAuthGuard`). | Bạn E |
| | Frontend (Next.js) | `/login` | Public | Form đăng nhập hoàn chỉnh, ẩn/hiện mật khẩu, lưu token và điều hướng. | Bạn B |
| | Frontend (Next.js) | `/auth`  | Public | Đăng ký tạo tài khoản   | Bạn B |
| **Task 8: Thanh toán & VNPay** | Backend (`POST`) | `/payments` | Bearer JWT + Idempotency | Thanh toán giả lập qua Ví (`WALLET`) hoặc Thẻ (`CARD`). | Bạn F & Bạn E |
| | Backend (`POST`) | `/payments/vnpay/create` | Bearer JWT + Idempotency | Khởi tạo URL giao dịch VNPay Sandbox có gắn chữ ký bảo mật SHA-512. | Bạn E |
| | Backend (`GET`) | `/payments/vnpay/ipn` | Public (Webhook) | Nhận kết quả ngầm (IPN) từ server VNPay, cập nhật đơn sang `PAID` an toàn. | Bạn E |
| | Backend (`GET`) | `/payments/vnpay/return` | Public | Xác thực chữ ký dữ liệu trả về và điều hướng trình duyệt về màn hình xác nhận FE. | Bạn E |
| | Frontend (Next.js) | `/cart` | Bearer JWT | Chọn `WALLET`/`CARD` hoặc `VNPAY` (Quét mã QR / Thẻ ATM), chuyển hướng thanh toán. | Bạn A & Bạn B |
| **Task 9: Lịch sử & Xác nhận đơn** | Frontend (Next.js) | `/order-confirmation` | Bearer JWT | Màn hình biên nhận tức thì: mã đơn, nhãn xanh `PAID`, gọi API lấy tổng tiền thật. | Bạn B (SM) |
| | Backend (`GET`) | `/orders/me` | Bearer JWT | Lấy danh sách lịch sử đơn hàng của tài khoản đang đăng nhập, sắp xếp mới nhất. | Bạn E & Bạn F |
| | Frontend (Next.js) | `/orders` | Bearer JWT | Giao diện lịch sử đơn hàng kết nối API thật, lọc theo trạng thái, nút Đăng xuất. | Bạn D & Bạn B |
| | DevOps / System | `docker-compose.yml` | --- | Đóng gói toàn bộ hệ thống (PostgreSQL, Backend NestJS, Frontend Next.js). | Bạn B (SM) |
| **Task 10.1: Máy trạng thái** | Backend (`PATCH`) | `/orders/:id/status` | Bearer JWT | Chuyển trạng thái đơn (`PENDING -> PAID -> PREPARING -> READY -> COMPLETED`). | Bạn C |
| **Task 10.2: Thanh toán Idempotent** | Backend (`POST`) | `/payments` | Bearer JWT + Idempotency-Key | Chống trừ tiền trùng lặp khi gửi lặp request. Kiểm tra khóa duy nhất trên DB. | Bạn C |
| **Task 10.3: Khóa tồn kho** | Backend (`POST`) | `/orders` | Bearer JWT | Kiểm soát đồng thời bằng Database Transaction và khóa lạc quan (Optimistic Lock). | Bạn E |
| **Task 10.4: Khuyến mãi & Loyalty** | Backend (`POST`) | `/orders`, `/payments` | Bearer JWT | Thẩm định mã giảm giá động trong PostgreSQL, tính điểm Loyalty (`+1 điểm / 10.000đ`). | Bạn C |

> 📌 **Tài liệu Kỹ thuật Chi tiết cho từng phân hệ mở rộng:**
> * Hướng dẫn tích hợp Cổng thanh toán VNPay Sandbox & Webhook ngrok: Xem tại [`backend/README_TASK8.md`](./backend/README_TASK8.md).
> * Hướng dẫn kiểm thử Docker Compose Full-stack & Lịch sử đơn hàng: Xem tại [`backend/README_TASK9.md`](./backend/README_TASK9.md).
> * Xem rõ hơn về nguyên liệu và các thành phần trong từng món trong menu tại [`backend/README-TASK10.3.md`](./backend/README-TASK10.3.md).
---

## 4. Hướng dẫn Khởi chạy Hệ thống

### 4.1. Kịch bản A: Docker 1 chạm (Dành cho Giảng viên nghiệm thu)
Không cần cài đặt thủ công Node.js, chỉ cần mở Docker Desktop và chạy lệnh tại thư mục gốc:

```bash
docker compose up -d --build
```

Sau khi terminal hiển thị `[+] Running 3/3`, mở trình duyệt truy cập:
* **Giao diện Người dùng (Frontend Next.js)**: `http://localhost:3001`
* **Tài liệu API (Swagger UI NestJS)**: `http://localhost:3000/api/docs`

*Lưu ý khi khởi tạo CSDL lần đầu:* Nạp nhanh 10 món đồ uống mẫu vào database:
```bash
docker exec -it brewlite_backend npx prisma db seed
```
*Lệnh dừng hệ thống sau khi nghiệm thu:* `docker compose down`

---

### 4.2. Kịch bản B: Chế độ phát triển (Development Mode)

#### Bước 1: Khởi động Database PostgreSQL (Docker)
Tại thư mục gốc dự án:
```bash
docker compose up -d postgres
```

#### Bước 2: Khởi chạy Backend NestJS (Terminal 1)
```bash
cd backend
npm install
copy .env.example .env
# (Lưu ý: Điền mã VNPAY_TMN_CODE và VNPAY_HASH_SECRET nếu chạy cổng thanh toán VNPay)
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev
```
Backend lắng nghe tại: `http://localhost:3000` (Swagger UI: `http://localhost:3000/api/docs`).

#### Bước 3: Khởi chạy Frontend Next.js (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend lắng nghe tại: `http://localhost:3001`.

---

### 4.3. Quản trị Cơ sở dữ liệu Trực quan (Prisma Studio)
Để trực tiếp quan sát biến động số liệu trong các bảng `Product`, `Ingredient`, `Order`, `Payment`, mở một terminal tại thư mục `backend`:
```bash
npx prisma studio
```
Truy cập giao diện quản trị tại: `http://localhost:5555`.

---

## 5. Kịch bản Nghiệm thu End-to-End (E2E Test Flow)

Quy trình trải nghiệm hoàn chỉnh toàn bộ tính năng liên thông giữa Frontend, Backend và Cổng VNPay:

1. **Đăng nhập (`/login`)**: Truy cập `http://localhost:3001/login`, nhập email `user@example.com` / mật khẩu `Password123` để lấy phiên làm việc.
2. **Chọn món & Tùy chỉnh (`/`)**: Tại trang chủ, bấm món **Bạc xỉu**, chọn Size M và thêm Topping "Trân châu", bấm "Thêm vào giỏ".
3. **Giỏ hàng & Khuyến mãi (`/cart`)**: 
   * Kiểm tra Badge số lượng hiển thị trên giỏ hàng.
   * Nhập mã ưu đãi `WELCOME5` bấm "Áp dụng" $\rightarrow$ Số tiền được giảm giá trực tiếp.
4. **Kiểm tra Khóa kho (Task 10.3)**: Mở Prisma Studio xem lượng tồn kho của nguyên liệu `Sữa đặc` và `Bột cà phê`.
5. **Thanh toán qua Cổng VNPay (Task 8)**:
   * Tích chọn phương thức **CỔNG VNPAY (QR / ATM)**.
   * Bấm "Xác nhận & Thanh toán".
   * Kiểm tra Prisma Studio: Đơn hàng mới tạo ở trạng thái `PENDING`, kho nguyên liệu đã bị trừ giữ chỗ thành công.
   * Trình duyệt tự động chuyển hướng sang Cổng thanh toán Sandbox của VNPay.
6. **Xác nhận giao dịch Sandbox**:
   * Chọn ngân hàng **NCB**, nhập số thẻ: `9704198526191432198`, tên: `NGUYEN VAN A`, ngày phát hành: `07/15`, OTP: `123456`.
   * Bấm xác nhận thanh toán.
7. **Biên nhận thành công (`/order-confirmation`)**:
   * Trình duyệt tự động quay trở về màn hình biên nhận của BrewLite.
   * Hiển thị biểu tượng xanh, mã đơn hàng thật `#...`, trạng thái **PAID** và tổng số tiền chính xác từ CSDL.
8. **Kiểm tra Lịch sử đơn (`/orders`)**:
   * Bấm nút "Xem lịch sử đơn hàng", đơn hàng vừa thanh toán xuất hiện ở đầu danh sách với đầy đủ chi tiết món.

---

## 6. Hướng dẫn Kiểm thử Chi tiết từng Task (Definition of Done)

> **Lưu ý kiểm thử API trên Swagger UI (`http://localhost:3000/api/docs`):**  
> Trước khi thực hiện các API yêu cầu đăng nhập, gọi `POST /auth/login` để nhận `accessToken`, sau đó bấm nút **Authorize** ở góc trên bên phải màn hình Swagger và dán: `Bearer <token>`.

---

### Task 1: Thiết lập Monorepo & Môi trường Docker
* **Người phụ trách:** Thành viên B (Scrum Master / DevOps)
* **Tiêu chí nghiệm thu (DoD):**
  1. Cấu trúc Monorepo phân tách rõ ràng giữa `/frontend` và `/backend`.
  2. Tệp `docker-compose.yml` khởi tạo được container PostgreSQL với network độc lập và volume lưu trữ dữ liệu an toàn.
* **Cách chạy & kiểm tra:**
  ```bash
  docker compose up -d postgres
  docker ps
  ```
  *Kết quả:* Container `brewlite_postgres` hiển thị trạng thái `Up` tại cổng `5432`.

---

### Task 2: API Quản lý Danh mục Sản phẩm & Tồn kho
* **Người phụ trách:** Thành viên C
* **Tiêu chí nghiệm thu (DoD):** Lấy danh sách sản phẩm và thông tin chi tiết kèm số lượng tồn kho từ PostgreSQL.
* **Cách chạy & kiểm tra:**
  * Gọi `GET /products` $\rightarrow$ Trả về mã `200 OK` kèm mảng các món đồ uống từ CSDL (tên, giá, ảnh, tồn kho).
  * Gọi `GET /products/1` $\rightarrow$ Trả về thông tin chi tiết của sản phẩm có ID 1.
  * Gọi `GET /products/99999` $\rightarrow$ Trả về mã lỗi `404 Not Found`.

---

### Task 3: Giao diện Menu Sản phẩm dạng lưới (Grid UI)
* **Người phụ trách:** Thành viên D
* **Tiêu chí nghiệm thu (DoD):** Hiển thị danh mục món dạng lưới responsive, tích hợp ô tìm kiếm và bộ lọc tab theo danh mục.
* **Cách chạy & kiểm tra:**
  * Mở trình duyệt vào `http://localhost:3001`.
  * Nhập chữ "Latte" vào ô tìm kiếm $\rightarrow$ Danh sách tự động lọc ra món Latte.
  * Bấm chọn các tab phân loại (Cà phê phin, Cà phê máy) $\rightarrow$ Menu đổi theo nhóm món tương ứng.

---

### Task 4: Giao diện Modal Tùy chỉnh (Size, Topping, Tính giá)
* **Người phụ trách:** Thành viên D
* **Tiêu chí nghiệm thu (DoD):** Nhấp vào sản phẩm sẽ bật modal tùy chỉnh: chọn kích cỡ (S/M/L), chọn topping đi kèm, tự động cộng dồn giá tiền theo thời gian thực.
* **Cách chạy & kiểm tra:**
  * Tại trang chủ, bấm nút "+ Thêm món" tại món Bạc xỉu.
  * Chọn Size L $\rightarrow$ Giá hiển thị tự động cộng thêm 10.000đ.
  * Tích chọn thêm Topping "Trân châu" $\rightarrow$ Giá tiếp tục cộng dồn chính xác.

---

### Task 5: Quản lý Trạng thái Giỏ hàng (Cart Context)
* **Người phụ trách:** Thành viên B (SM) & Thành viên A
* **Tiêu chí nghiệm thu (DoD):** Quản lý trạng thái giỏ hàng toàn cục qua React Context, lưu trữ vào `localStorage`, chuyển trang hoặc tải lại không bị mất dữ liệu.
* **Cách chạy & kiểm tra:**
  * Thêm món từ Menu vào giỏ $\rightarrow$ Badge số lượng trên Navbar tự động nhảy số.
  * Truy cập `http://localhost:3001/cart` $\rightarrow$ Toàn bộ thông tin món, size, topping và tổng tiền được giữ nguyên vẹn.
  * Thao tác nút tăng `+` / giảm `-` số lượng hoặc bấm nút "Xóa tất cả" $\rightarrow$ Dữ liệu cập nhật ngay lập tức.
  * Nhấn F5 tải lại trang $\rightarrow$ Giỏ hàng vẫn duy trì nguyên vẹn.

---

### Task 6: API Tạo Đơn hàng & Trừ Tồn kho (Database Transaction)
* **Người phụ trách:** Thành viên F & Thành viên C
* **Tiêu chí nghiệm thu (DoD):**
  1. Kiểm định dữ liệu DTO qua `class-validator`.
  2. Thực hiện trừ tồn kho trong Database Transaction, hỗ trợ đặt cùng món với các size/topping khác nhau.
* **Cách chạy & kiểm tra (Swagger):**
  * Gọi `POST /orders` với payload mẫu:
    ```json
    {
      "items": [
        {
          "productId": 1,
          "qty": 1,
          "size": "M",
          "toppings": ["Trân châu"]
        }
      ],
      "promotionCode": "WELCOME5"
    }
    ```
  * *Kết quả:* Trả về mã `201 Created`, trạng thái đơn là `PENDING`. Mở Prisma Studio kiểm tra kho nguyên liệu/sản phẩm đã được trừ tạm giữ.

---

### Task 7: Xác thực Người dùng (Auth JWT, Bcrypt & Giao diện Login)
* **Người phụ trách:** Thành viên E (Backend API) & Thành viên B (Frontend Integration)
* **Tiêu chí nghiệm thu (DoD):**
  1. API `POST /auth/register`: Mật khẩu được băm an toàn qua Bcrypt, lưu trữ trong PostgreSQL.
  2. API `POST /auth/login`: Xác thực thông tin và cấp chuỗi token `accessToken` (JWT).
  3. Giao diện `/login`: Form đăng nhập hoàn chỉnh, có nút ẩn/hiện mật khẩu, tự động lưu token vào `localStorage` và chuyển hướng.
* **Cách chạy & kiểm tra:**
  * Truy cập `http://localhost:3001/login`, nhập email `user@example.com` và mật khẩu `Password123`.
  * Bấm biểu tượng con mắt để kiểm tra ẩn/hiện mật khẩu.
  * Bấm "Đăng nhập ngay" $\rightarrow$ Hệ thống gửi request xác thực, lưu token và chuyển hướng sang `/orders`.

---

### Task 8: Thanh toán Không tiền mặt & Tích hợp Cổng VNPay Sandbox
* **Người phụ trách:** Thành viên E (Backend VNPay & IPN) & Thành viên A, B (Frontend Integration)
* **Tiêu chí nghiệm thu (DoD):**
  1. **Đa dạng phương thức:** Hỗ trợ thanh toán nội bộ (`WALLET`, `CARD`) và tích hợp cổng thanh toán thực tế **VNPAY Sandbox** (quét mã VNPAY-QR hoặc thẻ ATM nội địa).
  2. **Kiến trúc Asynchronous Payment (VNPay):**
     * Sinh mã URL thanh toán kèm chữ ký bảo mật SHA-512 (`POST /payments/vnpay/create`).
     * Lắng nghe Webhook IPN (`GET /payments/vnpay/ipn`) để cập nhật trạng thái đơn `PAID` từ máy chủ VNPay, chống gian lận Client-side.
     * Tự động chuyển hướng trình duyệt sau thanh toán về trang `/order-confirmation` hiển thị thông tin biên lai thật.
  3. **Chống trừ tiền trùng lặp (Task 10.2):** Bắt buộc Header `Idempotency-Key` trên API thanh toán.
  4. **Xử lý ngoại lệ (PAYMENT_FAILED):** Giả lập từ chối giao dịch, giữ lại giỏ hàng, cho phép chọn lại phương thức hoặc thử lại.
* **Cách chạy & kiểm tra:**
  * Xem tài liệu hướng dẫn cấu hình ngrok và danh sách thẻ test tại [`backend/README_TASK8.md`](./backend/README_TASK8.md).
  * Tại `/cart`, chọn **CỔNG VNPAY (QR / ATM)** $\rightarrow$ Bấm thanh toán $\rightarrow$ Chuyển sang giao diện VNPay $\rightarrow$ Nhập thẻ NCB test $\rightarrow$ Nhận diện thanh toán thành công và chuyển về trang biên nhận.

---

### Task 9: Lịch sử Đơn hàng, Xác nhận Đơn & Đóng gói Docker
* **Người phụ trách:** Thành viên B (DevOps, Biên nhận & Quản lý Release) & Thành viên D, F (Giao diện & API Lịch sử đơn)
* **Tiêu chí nghiệm thu (DoD):**
  1. **Màn hình Biên nhận (`/order-confirmation`):** Hiển thị lời chúc mừng, mã đơn thật `#...`, nhãn xanh `PAID`, gọi API lấy tổng tiền thật và lời nhắc nhận đồ tại quầy.
  2. **API & Giao diện Lịch sử đơn (`/orders`):**
     * Endpoint `GET /orders/me` được bảo vệ bằng JWT Guard, lọc chính xác các đơn hàng của tài khoản đang đăng nhập.
     * Giao diện `/orders` hiển thị dữ liệu thật từ CSDL, sắp xếp mới nhất lên đầu, hỗ trợ tab lọc trạng thái.
  3. **Đóng gói Docker Compose:** Toàn bộ hệ thống chạy trơn tru qua `docker-compose.yml`.
* **Cách chạy & kiểm tra:**
  * Xem tài liệu chi tiết tại [`backend/README_TASK9.md`](./backend/README_TASK9.md).
  * Hoàn tất thanh toán $\rightarrow$ Xem màn hình biên nhận $\rightarrow$ Bấm "Xem lịch sử đơn hàng" $\rightarrow$ Kiểm tra thông tin đơn hàng vừa đặt.

---

### Task 10.1: Máy trạng thái Đơn hàng (Order State Machine)
* **Người phụ trách:** Thành viên C
* **Tiêu chí nghiệm thu (Tiêu chí chấm a):** Chặn đổi trạng thái sai; tự động hoàn kho khi đơn bị hủy hoặc lỗi thanh toán.
* **Cách chạy & kiểm tra:**
  * Chạy Unit Test tự động (14 bài test):
    ```bash
    npm test -- orders.service.spec.ts
    ```
  * Kiểm tra trên Swagger qua `PATCH /orders/:id/status`:
    * Chuyển hợp lệ: `PAID` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED` (Thành công).
    * Cố tình nhảy cóc: Đơn đang `PENDING` mà gửi chuyển sang `COMPLETED` $\rightarrow$ Nhận mã lỗi `400 Bad Request`.
    * Chuyển `PENDING` $\rightarrow$ `CANCELLED` $\rightarrow$ Kiểm tra CSDL thấy số lượng tồn kho tự động được hoàn trả.

---

### Task 10.2: Thanh toán Idempotent (Chống trừ tiền trùng lặp)
* **Người phụ trách:** Thành viên C
* **Tiêu chí nghiệm thu (Tiêu chí chấm b):** Sử dụng Header `idempotency-key`. Gửi 2 lần cùng key chỉ thực hiện 1 lần giao dịch, không trừ tiền 2 lần.
* **Cách chạy & kiểm tra:**
  * Chạy Unit Test tự động (11 bài test):
    ```bash
    npm test -- payments.service.spec.ts
    ```
  * Kiểm tra trên Swagger qua `POST /payments`:
    * Lần 1: Điền Header `idempotency-key: KEY-TEST-01`, gọi thanh toán đơn $\rightarrow$ Thành công `200/201`.
    * Lần 2: Giữ nguyên `idempotency-key: KEY-TEST-01`, bấm Execute lần nữa $\rightarrow$ Server trả về kết quả cũ, cổng thanh toán không bị gọi lại lần 2.
    * Mở Prisma Studio $\rightarrow$ Bảng `Payment` chỉ có duy nhất 1 bản ghi mang key `KEY-TEST-01`.

---

### Task 10.3: Kiểm soát Tồn kho khi Đặt đồng thời (Optimistic Locking)
* **Người phụ trách:** Thành viên E
* **Tiêu chí nghiệm thu (Tiêu chí chấm c):** Sử dụng trường `version` và Database Transaction. Khi nhiều luồng cùng đặt 1 ly cuối cùng, chỉ 1 đơn thành công, tồn kho không bao giờ bị âm.
* **Cách chạy & kiểm tra:**
* Xem tài liệu chi tiết tại [`backend/README-TASK10.3.md`](./backend/README-TASK10.3.md).
  * Chạy bài test tranh chấp đồng thời:
    ```bash
    npm test -- stock-concurrency.integration.ts
    ```
  * *Kết quả terminal in ra:*
    * Số request gửi đồng thời: 5
    * Số đơn tạo thành công: 1
    * Số đơn bị từ chối do lệch version: 4
    * Tồn kho sau cùng: 0 (Tuyệt đối không bị âm). Cột `version` trong CSDL tăng thêm 1.

---

### Task 10.4: Khuyến mãi & Tích lũy Điểm thưởng (Loyalty)
* **Người phụ trách:** Thành viên C
* **Tiêu chí nghiệm thu:** Áp mã giảm giá hợp lệ (`PERCENT` hoặc `FIXED`), kiểm tra điều kiện đơn tối thiểu và tự động cộng điểm thưởng vào bảng `LoyaltyTransaction` khi đơn hàng `PAID`.
* **Cách chạy & kiểm tra:**
  * Gọi `POST /orders` có kèm `"promotionCode": "WELCOME5"` $\rightarrow$ Đơn hàng được chiết khấu chính xác theo % quy định.
  * Gọi thanh toán cho đơn hàng trên $\rightarrow$ Sau khi đơn chuyển sang `PAID`, mở bảng `LoyaltyTransaction` trên Prisma Studio: Xuất hiện dòng cộng điểm mới tương ứng với công thức `total / 10000`.

---

## 7. Kiểm thử Tự động Toàn hệ thống (Backend Test Suite)

Để kiểm tra toàn diện tất cả các tiêu chí chấm điểm kỹ thuật tự động của đề tài, tại thư mục `backend`, chạy lệnh duy nhất:

```bash
npm test -- --runInBand
```

**Kết quả kiểm thử chuẩn xác (100% PASS):**
```text
 PASS  src/payments/payments.service.spec.ts
 PASS  src/products/products.service.spec.ts
 PASS  src/orders/orders.controller.spec.ts
 PASS  test/stock-concurrency.integration.ts
 PASS  src/payments/payments.controller.spec.ts
 PASS  src/orders/orders.service.spec.ts
 PASS  src/app.controller.spec.ts

Test Suites: 7 passed, 7 total
Tests:       40 passed, 40 total
Snapshots:   0 total
Ran all test suites.
```
*(Hệ thống vượt qua 100% các tiêu chí kỹ thuật về State Machine, Khóa Idempotency và Tranh chấp Tồn kho đồng thời).*