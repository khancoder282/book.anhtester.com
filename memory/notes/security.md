# Lỗ hổng và điểm yếu đã xác nhận

> **Cập nhật 2026-11-20 — đã sửa hết 30 bug** của đợt exploratory (user chốt sửa hết, không giữ bug mẫu). Tóm tắt cách sửa các lỗ hổng chính:
> - `/view-file`, upload/rename/move/copy: đường dẫn giải mã một lần rồi phải nằm trong thư mục upload (`backend/src/utils/upload-security.ts`). File phục vụ kèm `nosniff`, CSP `sandbox`, chỉ ảnh raster mới `inline`. Upload kiểm loại file theo nội dung (magic bytes), không nhận SVG/HTML.
> - Access token mang `sid` (phiên trong `UserRefreshToken`); guard `verifyAccessToken` (`plugins/auth.ts`) từ chối phiên đã thu hồi → logout, đổi mật khẩu/email làm token cũ hết hiệu lực ngay. Refresh token là chuỗi ngẫu nhiên, DB lưu SHA-256, cookie 7 ngày.
> - `search` JSON (`plugins/filterTable.ts`) chặn `password`, `refreshTokens`, `tokenHash`… ở mọi độ sâu; lỗi không còn lộ nội dung Prisma.
> - Không có role: user chỉ sửa / khoá / xoá **chính mình** (`PATCH`, `DELETE /api/user/{id}` với id khác → 403).
> - `GET /api/file` liệt kê thư mục cần token (tải một file vẫn công khai để `<img>` dùng được); `GET /api/db/table` cần token; `POST /api/status` giới hạn `code` 200–599, `time` ≤ 30 giây.
>
> **Còn lại (chưa sửa, không có bug report):** chưa có rate limit cho `/api/login`; JWT vẫn rơi về `"secret-key"` nếu thiếu `JWT_SECRET`; `GET /api/file/info` công khai (chỉ trả 2 con số dung lượng, cố ý). Phần dưới là ghi chú gốc trước khi sửa, giữ để tra lịch sử.

> **Đợt exploratory testing 2026-11-20 đã ghi chi tiết 30 bug (9 Critical) trong [`docs/bugs/README.md`](../../docs/bugs/README.md).** Các bug bảo mật nghiêm trọng nhất là: đọc file bất kỳ qua `/view-file` (`BUG_system_1795111377_EXP01`), ghi file ra ngoài thư mục upload (`BUG_file_1795111378_EXP01`), stored XSS đọc token (`BUG_file_1795111379_EXP02`), chiếm tài khoản qua `search` kết hợp refresh token đã revoke (`BUG_user_1795111372_EXP02` + `BUG_auth_1795111365_EXP01`). Phần dưới đây là ghi chú ban đầu, chi tiết xem trong từng file bug.

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

- `elysia-rate-limit` và `@elysiajs/cors` đã bị gỡ trên nhánh `deploy-vps`, nên hiện **không có rate limit** cho `/api/login`. CORS được viết tay trong `index.ts` từ 2026-11-20: `Allow-Origin: *`, **không** cho credentials (cookie `refetchToken` không đi cross-origin) — xem `features/system.md`.
- JWT dùng `"secret-key"` nếu thiếu biến `JWT_SECRET` mà không báo lỗi gì. Trên server phải kiểm tra kỹ biến này.
