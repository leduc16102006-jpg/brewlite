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
Frontend chạy tại: http://localhost:3000 (Truy cập hiển thị "Hello BrewLite! siuuuu ")