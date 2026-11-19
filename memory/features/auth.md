# Auth: đăng ký, đăng nhập, token

Code: `backend/src/routers/auth-controller.ts`, `backend/src/plugins/auth.ts` (guard + helper token/validate), `backend/src/plugins/jwt-app.ts`
Frontend: `src/pages/sign-in/`, `src/pages/user-mgt/sign-up.tsx`, `profile.tsx`, `setting.tsx`. Route: `/sign-in`, `/sign-up`.

## Endpoint

| Method | Path | Cần token | Body / ghi chú |
|---|---|---|---|
| POST | `/api/register` | Không | `name` (không rỗng/khoảng trắng, ≤ 191, được trim), `email` (≤ 191), `password` (≥ 6), tuỳ chọn `avatarUrl`, `phone`, `address`. 201 `{ msg }`; lỗi dữ liệu / email trùng → 422 `{ msg, fields }` |
| POST | `/api/login` | Không | `email`, `password`. 200 `{ msg, accessToken, exp }` + cookie `refetchToken` (Max-Age 604800), `accessToken`. Sai email **hoặc** sai mật khẩu → cùng 401 `Invalid email or password.` (kèm `fields.email`, `fields.password`). Tài khoản khoá → 403 `User account is disabled.` **chỉ khi mật khẩu đúng** |
| POST | `/api/refetch-token` | Không | Đọc cookie `refetchToken`, trả `{ msg, accessToken, exp }`. Token lạ / hết hạn / đã thu hồi / khác User-Agent hoặc IP → 404 `Invalid token.`; tài khoản khoá → 403; thiếu cookie → 422 |
| PATCH | `/api/profile` | Có | Chỉ cập nhật trường có gửi. Đổi mật khẩu phải có `password_old` (thiếu/sai → 400). Email trùng → 422 `Email is already in use.` + `fields.email`. 200 `{ msg, requireLogin }`: `requireLogin = true` khi đổi email hoặc mật khẩu (mọi phiên đã bị thu hồi). `password: ""` = giữ mật khẩu cũ |
| GET | `/api/me` | Có | Thông tin user hiện tại |
| DELETE | `/api/logout` | Có | Thu hồi phiên của access token đang dùng (và phiên của cookie `refetchToken` nếu có), xoá 2 cookie. Access token đó dùng lại → 401 |

## Cách xác thực (từ 2026-11-20)

- Mỗi lần login tạo một **phiên** = bản ghi `UserRefreshToken`. Access token (JWT) mang `{ id, sid }`, `sid` = id phiên.
- Guard `auth` chỉ nhận header `Authorization: Bearer <token>`, verify JWT rồi đọc phiên theo `sid`: phiên không còn / `revoked` / khác user → 401 `Token has been revoked. Please login again.`; token không có `sid` (phát hành trước bản sửa) → 401 `Invalid or expired token`; user `isActive = false` → 403 `User account is disabled`. Mỗi request có token tốn 1 query (phiên + user).
- Refresh token gửi cho client là chuỗi ngẫu nhiên 64 hex; DB chỉ lưu **SHA-256** (`tokenHash`). Trước đây cookie chính là `tokenHash` (argon2) lưu trong DB nên lộ DB = lộ token. Bản ghi cũ dạng argon2 không còn dùng được.
- Thu hồi phiên: logout (phiên hiện tại); đổi mật khẩu hoặc email qua `/profile` hay `/user/{id}` (mọi phiên của user).
- `plugins/black-list-token.ts` (blacklist trong RAM) **không dùng**: blacklist trong RAM mất khi server restart (`bun --watch` restart mỗi lần sửa file), nên chọn cách kiểm phiên trong DB.
- JWT ký bằng `JWT_SECRET`, hạn `EXPTOKEN` (local `6d`, mặc định `30m`). Refresh token hạn 7 ngày.
- Mật khẩu hash bằng `Bun.password` (argon2). Login với email không tồn tại vẫn verify với một hash giả để thời gian phản hồi tương đương.
- Kiểm tra tên/mật khẩu dùng chung: `validateUserInput()` trong `plugins/auth.ts`.
- Không có role hay phân quyền: mọi user như nhau.

## Frontend

- `src/api/axios.ts`: gặp 401 thì gọi `/refetch-token` rồi thử lại, **trừ** `/login`, `/register`, `/refetch-token` (401 của login là sai mật khẩu, không phải hết hạn token).
- Store `useAuth` (`src/store/auth.ts`) có `checked`: bật khi lần gọi `/me` đầu tiên của `CheckAuth` xong. `useAuthCheck()` chỉ đẩy sang Sign in khi `checked && !auth`, nên mở thẳng URL/F5 trang Setting, My profile không bị đẩy về Sign in.
- Trang My profile: đổi email/mật khẩu thành công thì chỉ xoá token phía client rồi về Sign in (backend đã thu hồi phiên, không gọi `/logout`).
- Lỗi mạng (không có `err.response`) hiện toast `auth.toast.networkError` / `user.toast.networkError`.

## Lưu ý

- Tài khoản test local (tạo 2026-11-19): `admin@example.com` / `123456`, tên "Admin".
- Swagger: schema email dùng `examples`, **không** dùng `default` (Elysia điền `default` vào body khi client không gửi — đó là nguyên nhân bug email bị ghi đè thành `user@example.com`).
- Schema lỗi trong controller: `fields` phải là `t.Optional(...)`. Handler trả `{ msg }` mà schema bắt `fields` thì Elysia ném VALIDATION và client chỉ thấy 422 "Property 'fields' is missing".
