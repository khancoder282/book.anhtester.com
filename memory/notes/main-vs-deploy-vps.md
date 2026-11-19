# Khác biệt giữa `main` và `deploy-vps`

So sánh 2026-11-20: 174 file thay đổi. `deploy-vps` mới hơn và là nhánh nên dùng.

| Mục | `main` | `deploy-vps` |
|---|---|---|
| Cổng backend, target proxy của Vite | 4544 | **4566** |
| Output build frontend | `../../public` (ra ngoài repo) | `../backend/public` |
| Backend phục vụ frontend | Không thật sự | Có (`/assets/*`, catch-all `/*`) |
| CORS, rate limit | Có `@elysiajs/cors`, `elysia-rate-limit` | Đã gỡ cả hai |
| Script seed | `fake` → `src/prisma-fake.ts` | `fake` → `src/fake.ts` (**file không tồn tại**) |
| Script build/start | Không có | `build`, `build:client`, `build:server`, `start` |
| Schema | | Thêm `User.config` (JSON), bảng `Address`, một số cột chuyển sang `@db.Text`, đổi index |
| API mới | | `/api/address`, `/api/status`, `/api/db/table`, `/view-file/*`, `/assets/*`. Auth (`/login`, `/register`, `/refetch-token`, `/profile`, `/me`, `/logout`) đã có từ `main` |
| Frontend | Có `sign-up/` riêng, `test.tsx` | Thêm trang chủ giới thiệu (`home/`), `db-mgt/`. Gộp sign-up vào `user-mgt/`. Bỏ `sections/user` cũ |

Khi chuyển nhánh phải: đổi `PORT` trong `backend/.env`, chạy lại `bun install` cho cả hai phần, rồi `prisma generate` và `prisma db push`.
