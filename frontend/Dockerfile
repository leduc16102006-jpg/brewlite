FROM node:20-alpine

WORKDIR /app

# Cài đặt thư viện
COPY package*.json ./
RUN npm install

# Copy mã nguồn
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

# Thiết lập biến môi trường để Next.js lắng nghe trên 0.0.0.0
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]