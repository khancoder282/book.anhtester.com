# Dựng môi trường local

Đã làm và chạy được ngày 2026-11-19 trên Windows 11 (máy `anhtester`).

## Công cụ

- **Bun**: ban đầu máy chưa có, đã cài bằng `npm install -g bun` (bản 1.4.5). Backend bắt buộc dùng Bun vì code gọi `Bun.env`, `Bun.password`, `Bun.randomUUIDv7`.
- **MySQL**: lấy của WAMP (`C:\wamp64\bin\mysql\mysql8.4.13`), chạy sẵn ở `127.0.0.1:3306`, user `root`, không mật khẩu. Client: `C:\wamp64\bin\mysql\mysql8.4.13\bin\mysql.exe`.
- Database: `book_anhtester` (utf8mb4).

## `backend/.env` (gitignore)

```
PORT="4566"
JWT_SECRET="..."
DATABASE_URL="mysql://root:@127.0.0.1:3306/book_anhtester"
EXPTOKEN="6d"
FILEDIR="upload"
```

Những chỗ dễ sai:
- `.env.example` trên `main` ghi `SECRET`, nhưng code đọc `JWT_SECRET`. Thiếu biến này thì code âm thầm dùng `"secret-key"`.
- `.env.example` trên `main` ghi `DATABASE_URL="file:./dev.db"` (SQLite), nhưng schema là `mysql`, nên phải đổi.
- **`PORT` phải khớp với target proxy trong `frontend/vite.config.ts`**: `deploy-vps` dùng 4566, `main` dùng 4544. Lệch cổng thì frontend gọi API sẽ lỗi.

## Lệnh

```
cd backend && bun install && bunx prisma generate && bunx prisma db push
cd frontend && bun install
cd backend && bun run dev      # :4566
cd frontend && bun run dev     # :3039
```

- Prisma client được generate vào `backend/src/prisma/`. **Sau mỗi lần chuyển nhánh** nên chạy lại `bun install`, `prisma generate`, `prisma db push`, vì hai nhánh khác dependency và schema.
- Vite cần khoảng 10 giây để khởi động lần đầu. Mở trình duyệt sớm hơn thì sẽ thấy trang lỗi, chỉ cần tải lại.
- Có cấu hình `.claude/launch.json` (chưa commit) để mở hai server bằng browser pane của Claude. Cờ `--cwd` của bun phải viết dạng `--cwd=<đường dẫn tuyệt đối>`; viết tách hai tham số thì bun chỉ in ra trang help.
- `GET /api/me` trả 401 và `POST /api/refetch-token` trả 422 khi chưa đăng nhập. Đó là bình thường.
