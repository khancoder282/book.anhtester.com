# Dựng môi trường local

Đã làm và chạy được ngày 2026-11-19 trên Windows 11 (máy `anhtester`).

## Công cụ

- **Bun**: ban đầu máy chưa có, đã cài bằng `npm install -g bun` (bản 1.4.5). Backend bắt buộc dùng Bun vì code gọi `Bun.env`, `Bun.password`, `Bun.randomUUIDv7`.
- **MySQL**: lấy của WAMP (`C:\wamp64\bin\mysql\mysql8.4.13`), chạy sẵn ở `127.0.0.1:3306`, user `root`, không mật khẩu. Client: `C:\wamp64\bin\mysql\mysql8.4.13\bin\mysql.exe`.
- Database: `book_anhtester` (utf8mb4).
- **phpMyAdmin** (chỗ user quản lý DB chính): `http://localhost/phpmyadmin/`, đăng nhập `root`, mật khẩu trống, chọn DB `book_anhtester`. Cần Apache của WAMP. Ngày 2026-11-20: service `wampapache64` / `wampmysqld64` để Manual và đang Stopped, "Start All Services" của WAMP không bật hết được, trong khi `mysqld.exe` vẫn chạy ngoài service. Bật Apache không cần quyền admin: kiểm tra `C:\wamp64\bin\apache\apache2.4.70\bin\httpd.exe -t`, rồi chạy `Start-Process` file đó với `-WindowStyle Hidden`. Tiến trình mất khi khởi động lại máy. Lần đầu tải phpMyAdmin có thể chậm vài giây.

## `backend/.env` (gitignore)

```
PORT="4566"
JWT_SECRET="..."
DATABASE_URL="mysql://root:@127.0.0.1:3306/book_anhtester"
EXPTOKEN="6d"
FILEDIR="upload"
```

Những chỗ dễ sai:
- `.env.example` trên `main` cũ (trước 2026-11-21) ghi `SECRET`, nhưng code đọc `JWT_SECRET`. Thiếu biến này thì code âm thầm dùng `"secret-key"`.
- `.env.example` trên `main` cũ ghi `DATABASE_URL="file:./dev.db"` (SQLite), nhưng schema là `mysql`, nên phải đổi.
- **`PORT` phải khớp với target proxy trong `frontend/vite.config.ts`**: **4566** (`main` cũ trước 2026-11-21 dùng 4544). Lệch cổng thì frontend gọi API sẽ lỗi.

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
- ⚠️ **MySQL của WAMP có `default_storage_engine = MyISAM`** (kiểm 2026-11-21). `prisma db push` tạo bảng **mới** theo engine mặc định, nên bảng mới thành MyISAM: không có khoá ngoại (Cascade / SetNull không chạy), không có transaction. Các bảng cũ đang là InnoDB. Sau khi `db push` tạo bảng mới, kiểm `SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()`; bảng nào MyISAM thì `` ALTER TABLE `<bảng>` ENGINE=InnoDB `` rồi chạy lại `bunx prisma db push` để tạo khoá ngoại (xoá dòng mồ côi trước). Đã làm cho `Order`, `OrderItem` ngày 2026-11-21. Tên bảng lưu chữ thường (`lower_case_table_names = 1`).
- Tạo DB **trống** bằng `db push` trên WAMP thì lỗi `Specified key was too long; max key length is 1000 bytes` (giới hạn của MyISAM, index `User(name, email)` cần 1528 byte). Cách dựng DB thử không đổi cấu hình server: `bunx prisma migrate diff --from-empty --to-schema-datamodel <schema> --script` rồi chạy file SQL qua `mysql.exe` (`C:\wamp64\bin\mysql\mysql8.4.13\bin\`) với dòng đầu `SET SESSION default_storage_engine=InnoDB;`. `prisma db push --force-reset` bị Prisma chặn khi AI chạy (cần user đồng ý).
- ⚠️ **MySQL WAMP chạy `sql_mode` rỗng (không strict)** (kiểm 2026-11-21): chuỗi dài hơn cột bị **âm thầm cắt**, không báo lỗi. MySQL 8 trên VPS mặc định strict nên cùng dữ liệu đó trả lỗi 500. Thêm cột `VARCHAR` chứa dữ liệu không giới hạn độ dài (đường dẫn ảnh, text người dùng) thì kiểm độ dài, đừng tin test local. Đã gặp: `OrderItem.picture` (sửa thành `TEXT`).
- `GET /api/me` trả 401 và `POST /api/refetch-token` trả 422 khi chưa đăng nhập. Đó là bình thường.
