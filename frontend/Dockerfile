# Sử dụng môi trường Node.js 20 nhẹ (Alpine)
FROM node:20-alpine

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy các tệp cấu hình package vào trước để cài thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn frontend vào container
COPY . .

# Biên dịch Next.js sang bản Production tối ưu
RUN npm run build

# Mở cổng 3000 (mặc định của Next.js)
EXPOSE 3000

# Lệnh khởi chạy Server Frontend
CMD ["npm", "run", "start"]