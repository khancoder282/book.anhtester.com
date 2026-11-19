# Quản lý user

Code: `backend/src/routers/user-controller.ts`
Frontend: `src/pages/user-mgt/` (`index.tsx`, `columns.tsx`, `add-user-dialog.tsx`, `components/view-user.tsx`). Route: `/user-management`, `/user-management/my-profile`, `/user-management/setting-account`.

## Endpoint

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/user` | **Không** | Query: `page`, `limit`, `search`, `sort`, `sortBy`. Trả `{ list, pagination: { total, totalPage, currentPage, lengthData } }`. `search` sai / bị chặn → 400 `{ msg, error }` |
| GET | `/api/user/{id}` | **Không** | Chi tiết một user |
| POST | `/api/user` | Có | `name` (không rỗng/khoảng trắng, ≤ 191), `email`, `password` (≥ 6; thiếu/rỗng = `anhtester.com`), `avatarUrl`, `address`, `phone`, `isActive`. Lỗi dữ liệu / email trùng → 422 `{ msg, fields }` |
| PATCH | `/api/user/{id}` | Có | **Chỉ sửa được chính mình**: id của user khác → 403 `You can only update your own account.`, id không tồn tại → 404. `isActive: false` cho chính mình → 400 `You cannot disable your own account.`. Chỉ cập nhật trường có gửi. 200 `{ msg, requireLogin }` (đổi email/mật khẩu → thu hồi mọi phiên, `requireLogin = true`) |
| DELETE | `/api/user/{id}` | Có | **Chỉ xoá được chính mình**: user khác → 403 `You can only delete your own account.`, id không tồn tại → 404. Tự xoá thì mọi phiên mất theo, token hiện tại → 401 |

## Model `User`

`id` (cuid), `name` (VARCHAR 191), `email` (unique, VARCHAR 191), `password`, `avatarUrl` (TEXT), `isActive` (mặc định true), `phone`, `address` (TEXT), `config` (JSON, nullable), `createdAt`, `updatedAt`.

## Lưu ý

- `search` là chuỗi thường thì lọc `contains` trên các cột định sẵn; là **chuỗi JSON object** thì dùng làm `where` của Prisma sau khi `plugins/filterTable.ts` kiểm tra: cấm khoá `password`, `refreshTokens`, `tokenHash`, `deviceInfo`, `ipAddress`, `user` ở mọi cấp (400 `Filtering by "<key>" is not allowed.`), sâu tối đa 10 cấp, dài tối đa 5000 ký tự. Lỗi Prisma trả `error: "The search filter is not a valid query."` (không lộ đường dẫn file). `filterTable` dùng chung cho book và promotion.
- Không có role, nên quyết định (2026-11-20, theo yêu cầu "sửa hết bug"): mỗi user chỉ sửa/khoá/đổi mật khẩu/xoá **chính mình**, và không tự khoá được. Hệ quả: qua API không còn ai đặt `isActive = false` cho user đã có (chỉ tạo mới bằng `POST /user` với `isActive: false`).
- Web: menu **Edit** và **Delete** trong bảng user chỉ bật ở dòng của chính mình (dòng user khác bị tắt). Edit mở trang My profile; Delete xong thì xoá token phía client và về Sign in.
- Form user/sign-up/profile và Sign in giới hạn tên, email 191 ký tự (khớp cột VARCHAR(191)).
- Response không trả field `password`.
- Đặt `isActive = false` sẽ khiến user đó bị 403 ở mọi API cần token.
