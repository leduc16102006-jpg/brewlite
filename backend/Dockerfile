# Sử dụng môi trường Node.js 20 nhẹ (Alpine)
FROM node:20-alpine

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy các tệp cấu hình package vào trước để cài thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn backend vào container
COPY . .

# ✅ SỬA: Dùng biến môi trường, không cứng localhost
# Tạo Prisma Client — DATABASE_URL ở đây chỉ dùng lúc generate, không phải lúc chạy
RUN DATABASE_URL="postgresql://postgres:postgres@postgres:5432/brewlite_db?schema=public" npx prisma generate

# Biên dịch NestJS từ TypeScript sang JavaScript
RUN npm run build

# Mở cổng 3000
EXPOSE 3000

# ✅ SỬA: Dùng sh -c để chạy nhiều lệnh trong 1 dòng, biến môi trường từ .env/docker-compose sẽ có hiệu lực
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node dist/main"]