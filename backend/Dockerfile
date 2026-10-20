# Sử dụng môi trường Node.js 20 nhẹ (Alpine)
FROM node:20-alpine

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy các tệp cấu hình package vào trước để cài thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn backend vào container
COPY . .

# Khởi tạo Prisma Client
RUN npx prisma generate

# Biên dịch NestJS từ TypeScript sang JavaScript
RUN npm run build

# Mở cổng 3000
EXPOSE 3000

# Lệnh khởi chạy: Tự động đồng bộ CSDL (db push) trước khi chạy Server
CMD npx prisma db push && npm run start:prod