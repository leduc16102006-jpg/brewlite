# BrewLite - Coffee Ordering App

Dự án bài tập lớn môn Công nghệ Phần mềm - Học kỳ I (2026-2027)
Khoa Công nghệ Thông tin - Trường Đại học Sài Gòn.

## 1. Thành viên nhóm (6 thành viên)
- Thành viên A: Product Owner / Giỏ hàng & Thanh toán (Frontend)
- Thành viên B: Scrum Master / DevOps, Lịch sử đơn & Bàn giao
- Thành viên C: Developer / CSDL, Danh mục sản phẩm & State Machine
- Thành viên D: Developer / Giao diện Menu & Chi tiết sản phẩm
- Thành viên E: Developer / Xác thực tài khoản (JWT) & Tồn kho đồng thời
- Thành viên F: Developer / Đơn hàng, Thanh toán Idempotent & Điểm thưởng

## 2. Công nghệ sử dụng
- **Frontend**: Next.js (TypeScript, TailwindCSS)
- **Backend**: NestJS (TypeScript, REST API)
- **Database**: PostgreSQL (Prisma/TypeORM)
- **Hạ tầng**: Docker Compose, Git

## 3. Hướng dẫn cài đặt & Chạy trên môi trường cục bộ (Local)

### Yêu cầu môi trường
- Đã cài đặt Node.js (phiên bản 18+ hoặc 20+)
- Đã cài đặt Git

### Các bước cài đặt:
1. **Clone repository:**
   ```bash
   git clone <URL_REPO_CUA_NHOM>
   cd brewlite

   Cài đặt & Khởi chạy Backend:

Bash
cd backend
npm install
cp .env.example .env
npm run start:dev
Backend chạy tại: http://localhost:3000 (Truy cập hiển thị "Hello BrewLite Backend! siuuuuu ")

Cài đặt & Khởi chạy Frontend:

Bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
Frontend chạy tại: http://localhost:3001 (Truy cập hiển thị "Hello BrewLite! siuuuu ")

2. # API danh sach san pham va su dung mock data: **Branch: feature/task2-products-api**
   **Sua lai frontend nam o cong 3001**

   ## 1.Cai dat cac thu vien sau:
      npm install @nestjs/platform-express(**Nền tảng chạy NestJS trên Express — cốt lõi**)
      npm install @nestjs/swagger(**Tạo tài liệu API tự động**)
      npm install class-validator class-transformer(**Kiểm tra dữ liệu đầu vào;Chuyển đổi dữ liệu tự động, hỗ trợ validation**)

   ## 2.Sua lai mot chut ham main.ts o backend:
      Cấu hình CORS — Cho phép frontend gọi API(**Khắc phục lỗi "Access-Control-Allow-Origin" khi gọi từ frontend**)
      ValidationPipe — Kiểm tra dữ liệu tự động(**Áp dụng cho toàn bộ ứng dụng không cần khai báo lại ở từng controller**)
      Cấu hình Swagger — Tài liệu API trực quan(**Mở http://localhost:3000/api/docs → xem & test trực tiếp trên trình duyệt**)

   ## 3.API trả về danh sách menu gồm các trường:
      - id: mã sản phẩm(integer)
      - name: tên sản phẩm(string)
      - price: giá(integer)
      - image: đường dẫn ảnh(string)

   ## 4.Tao mock data:
      Tạo file backend/src/products/products.mock.ts
         interface Product định nghĩa cấu trúc của một sản phẩm.
         MOCK_PRODUCTS là mảng dữ liệu giả lập, đóng vai trò như dữ liệu lấy từ database.
         export cho phép các file khác sử dụng dữ liệu này.

   ## 5.Viet service:
      Tạo file backend/src/products/products.service.ts
         findAll() trả về toàn bộ danh sách sản phẩm.
         findOne(id) tìm một sản phẩm theo ID, có thể dùng cho API chi tiết sản phẩm về sau.
         @Injectable() cho phép NestJS quản lý và inject service.

   ## 6.Viet controller:
      Tạo file backend/src/products/products.controller.ts
         NestJS tự chuyển mảng object TypeScript thành JSON trong HTTP response.

   ## 7.Dang ky product module:
      Tạo file backend/src/products/products.module.ts
      Tiếp theo, mở backend/src/app.module.ts và đăng ký module
      Nếu AppModule của bạn đã có các module khác, hãy thêm ProductsModule vào mảng imports hiện tại, không xóa các module cũ

   ## 8.Chay backend:
      cd backend
      npm run start:dev
      kiem tra API GET/products: http://localhost:3000/products
      Backend chạy tại: http://localhost:3000
      Tài liệu Swagger: http://localhost:3000/api/docs

   **Đây là dữ liệu JSON mẫu mà API cần trả về. Các đường dẫn ảnh hiện chỉ là chuỗi URL tương đối; để ảnh hiển thị trên giao diện, frontend cần có ảnh tương ứng và xử lý đường dẫn đúng.**
