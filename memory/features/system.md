# Hệ thống, Swagger, route tĩnh

Code: `backend/src/index.ts`, `backend/src/regis.ts`, `backend/src/routers/database-controller.ts`.

## Endpoint

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/api/status` | Body `{ code, msg, time? }`, không cần token. Trả `{ msg }` với status code `code`, chờ `time` **giây** trước khi trả (dùng để tester giả lập lỗi hoặc độ trễ) |
| GET | `/api/db/table` | Ẩn khỏi Swagger (`hide: true`), **không cần token**. Chạy `SHOW TABLES`. Frontend dùng ở `/db-management` |
| GET | `/swagger` | Swagger UI (Scalar), JSON ở `/swagger/json` |
| GET | `/view-file/*` | Xem file trong thư mục upload |
| GET | `/assets/*` | File tĩnh của frontend đã build (`backend/public/assets`) |
| GET | `/*` | Catch-all, trả `backend/public/index.html` (SPA) |

## Swagger

- Scalar được tải từ CDN `cdn.jsdelivr.net`, nên **máy phải có mạng** thì Swagger mới hiện.
- Ô Server mặc định là `https://book.anhtester.com` (production). Muốn "Try it" trên máy thì đổi sang `http://localhost:4566`.
- Link "Swagger API Documentation" trên trang chủ là `/swagger` (đường dẫn tương đối). Khi dev ở cổng 3039, Vite phải proxy `/swagger` thì link này mới chạy (đã thêm 2026-11-20).

## Xử lý lỗi chung

- Lỗi validation trả **422** dạng `{ msg: "Invalid data.", fields: { <field>: [<thông báo>] } }`.
- Response có status > 300 được `console.log` ra terminal của backend.
- Mọi request `/api` đều được log dạng `[DD/MM/YYYY HH:mm:ss] METHOD: /path`.
