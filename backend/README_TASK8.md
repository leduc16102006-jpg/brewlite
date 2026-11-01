# Báo cáo Nghiệm thu Task 8: Tích hợp Cổng thanh toán VNPay

## 1. Giới thiệu Kiến trúc
Chức năng thanh toán VNPay được tích hợp vào hệ thống BrewLite bằng NestJS. Quy trình tuân thủ kiến trúc thanh toán bất đồng bộ (Asynchronous Payment):
- **Tạo URL:** Mã hóa thông số đơn hàng (amount, txnRef) cùng chữ ký SHA-512 (Hash Secret) đẩy sang VNPay.
- **Return URL:** Trình duyệt khách hàng được chuyển hướng về Frontend sau khi thanh toán để hiển thị trạng thái sơ bộ.
- **IPN (Webhook):** VNPay gọi trực tiếp về máy chủ Backend để cập nhật trạng thái đơn hàng (PAID) vào cơ sở dữ liệu PostgreSQL một cách bảo mật, ngăn chặn gian lận phía Client.

## 2. Cấu hình Môi trường (Local & Sandbox)
Hệ thống sử dụng môi trường VNPay Sandbox.
- **Merchant Admin:** `https://sandbox.vnpayment.vn/merchantv2/`
- **Tài khoản test:** `congdanhbui22@gmail.com`
- Các biến môi trường bắt buộc (Không đẩy lên Git):
  ```env
  VNPAY_TMN_CODE=...
  VNPAY_HASH_SECRET=...
  VNPAY_PAYMENT_URL=[https://sandbox.vnpayment.vn/paymentv2/vpcpay.html](https://sandbox.vnpayment.vn/paymentv2/vpcpay.html)
  VNPAY_RETURN_URL=http://localhost:3001/order-confirmation

## 3. Quy trình Kiểm thử với Ngrok (Localhost)
Do chạy ở localhost, hệ thống dùng ngrok để mở cổng public cho IPN:

Chạy ngrok http 3000 để lấy URL.

Cập nhật IPN URL trên Merchant Admin: https://<ngrok-url>/payments/vnpay/ipn.

Khởi tạo đơn qua POST /payments/vnpay/create.

Dùng thẻ Sandbox NCB (9704198526191432198 / NGUYEN VAN A / 07/15) để thanh toán.

Kiểm tra log NestJS báo IPN Success và bảng Payment trong DB chuyển sang PAID.


POST
/payments/vnpay/create: Tạo URL thanh toán VNPay

GET
/payments/vnpay/ipn: Nhận IPN callback từ VNPay

GET
/payments/vnpay/return: Xác minh kết quả trả về từ VNPay

GET
/payments/vnpay/ipn/test: Endpoint hỗ trợ kiểm tra Payment trong môi trường phát triển

5. Quy trình thanh toán:
  Frontend hoặc Swagger gọi API tạo thanh toán.
  Backend tạo URL thanh toán chứa thông tin giao dịch và chữ ký.
  Người dùng mở URL và thực hiện thanh toán trên VNPay Sandbox.
  VNPay gửi kết quả đến IPN URL.
  Backend xác minh chữ ký, mã merchant, số tiền và thông tin Payment.
  Nếu dữ liệu hợp lệ, backend cập nhật trạng thái thanh toán và đơn hàng theo logic nghiệp vụ.
  VNPay chuyển trình duyệt về Return URL để hiển thị kết quả cho người dùng.

6. Cấu hình môi trường:
  Cấu hình các biến môi trường cần thiết trong .env, bao gồm thông tin kết nối database và thông tin VNPay Sandbox.
  Không commit file .env, merchant secret hoặc các thông tin bí mật lên GitHub.

7. Kiểm tra bằng Swagger:
  http://localhost:3000/api/docs
  Các bước kiểm thử:
    1. Gọi POST /payments/vnpay/create để tạo URL thanh toán.
    2. Mở URL được trả về và thanh toán bằng thông tin Sandbox phù hợp.
    3. Kiểm tra log backend để xác nhận IPN được gọi và chữ ký hợp lệ.
    4. Kiểm tra Payment và Order trong PostgreSQL bằng pgAdmin.
    5. Kiểm tra Return URL để xác nhận kết quả được trả về trình duyệt.
  Lưu ý: Không nên bấm Execute trên IPN với dữ liệu giả để mô phỏng giao dịch thành công. Chữ ký không hợp lệ sẽ bị từ chối. Endpoint /ipn/test chỉ phục vụ kiểm tra dữ liệu đã lưu, không thay thế callback thật từ VNPay.  

8. demo test
  https://sandbox.vnpayment.vn/apis/vnpay-demo/



