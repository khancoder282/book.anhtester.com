# Lỗ hổng và điểm yếu đã xác nhận

App này là API cho tester thực hành, nên một số điểm có thể là cố ý. Dù vậy, cần biết chúng tồn tại trước khi deploy công khai.

## 1. Lọc user theo hash mật khẩu mà không cần đăng nhập (đã xác nhận 2026-11-20)

- `GET /api/user` không cần token.
- Tham số `search`, nếu là chuỗi JSON, được `plugins/filterTable.ts` dùng **nguyên văn làm `where` của Prisma**.
- Thử local:
  - `search={"password":{"startsWith":"$argon2"}}` trả về user admin.
  - `search={"password":{"startsWith":"zzz"}}` trả rỗng.
- Hệ quả: có thể dò dần từng ký tự của hash mật khẩu, và lọc theo bất kỳ cột hay quan hệ nào. Cùng kiểu `filterTable` cũng được dùng ở book và promotion.
- Hướng sửa: chỉ cho phép một danh sách cột cố định khi `search` là JSON, và loại `password` ra.

## 2. Logout không vô hiệu hoá access token

- `plugins/black-list-token.ts` có hàm `createBlackListToken()` nhưng không nơi nào gọi.
- Logout chỉ thu hồi refresh token, nên access token cũ vẫn dùng được cho tới khi hết hạn (local đặt `EXPTOKEN=6d`).

## 3. Endpoint không cần token

- `GET /api/db/table` chạy `SHOW TABLES`. Endpoint này bị ẩn khỏi Swagger nhưng vẫn gọi được công khai.
- `GET /api/file`, `GET /api/file/info` cho phép liệt kê file trong thư mục upload.
- `POST /api/status` có `time` tính bằng giây và không giới hạn, có thể bị dùng để giữ kết nối lâu.

## 4. Khác

- `elysia-rate-limit` và `@elysiajs/cors` đã bị gỡ trên nhánh `deploy-vps`, nên hiện **không có rate limit** cho `/api/login`.
- JWT dùng `"secret-key"` nếu thiếu biến `JWT_SECRET` mà không báo lỗi gì. Trên server phải kiểm tra kỹ biến này.
