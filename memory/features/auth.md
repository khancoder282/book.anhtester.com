# Auth: đăng ký, đăng nhập, token

Code: `backend/src/routers/auth-controller.ts`, `backend/src/plugins/auth.ts`, `backend/src/plugins/jwt-app.ts`
Frontend: `src/pages/sign-in/`, `src/pages/user-mgt/sign-up.tsx`, `profile.tsx`, `setting.tsx`. Route: `/sign-in`, `/sign-up`.

## Endpoint

| Method | Path | Cần token | Body / ghi chú |
|---|---|---|---|
| POST | `/api/register` | Không | `name`, `email`, `password`, tuỳ chọn `avatarUrl`, `phone`, `address`. Trả `{ msg: "Register successfully." }` |
| POST | `/api/login` | Không | `email`, `password`. Trả access token và `exp`, đồng thời set cookie `refetchToken`, `accessToken` |
| POST | `/api/refetch-token` | Không | Đọc cookie `refetchToken`, trả `{ accessToken }` mới. Không có cookie thì 422 (frontend gọi lúc chưa đăng nhập sẽ thấy lỗi này, đó là bình thường) |
| PATCH | `/api/profile` | Có | Sửa thông tin của chính mình. Đổi mật khẩu thì phải gửi kèm `password_old`. Có field `config` (JSON) |
| GET | `/api/me` | Có | Thông tin user hiện tại |
| DELETE | `/api/logout` | Có | Đánh dấu refresh token `revoked = true`, xoá cookie `refetchToken` và `accessToken` |

## Cách xác thực

- Guard `auth` **chỉ chấp nhận header** `Authorization: Bearer <token>`. Không có header thì trả 401 "Missing or invalid Authorization header", dù có cookie `accessToken` cũng vậy (code chỉ đọc cookie khi header là `Bearer` mà thiếu token).
- User có `isActive = false` thì trả 403 "User account is disabled".
- JWT ký bằng `JWT_SECRET`, hạn `EXPTOKEN` (local đặt `6d`, mặc định `30m`).
- Refresh token được lưu dạng hash (`Bun.password.hash`) trong bảng `UserRefreshToken`, kèm `deviceInfo`, `ipAddress`.
- Mật khẩu hash bằng `Bun.password` (argon2), hash bắt đầu bằng `$argon2`.
- Không có role hay phân quyền: mọi user đăng nhập đều có quyền như nhau.

## Lưu ý

- Có viết `plugins/black-list-token.ts` nhưng **không nơi nào dùng**, nên access token vẫn còn hiệu lực sau logout cho tới khi hết hạn. Xem [../notes/security.md](../notes/security.md).
- Tài khoản test local (tạo 2026-11-19): `admin@example.com` / `123456`, tên "Admin".
