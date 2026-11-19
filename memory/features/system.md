# Hệ thống, Swagger, route tĩnh

Code: `backend/src/index.ts`, `backend/src/regis.ts`, `backend/src/routers/database-controller.ts`.

## Endpoint

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/api/status` | Body `{ code, msg, time? }`, không cần token. Trả `{ msg }` với status code `code`, chờ `time` **giây** trước khi trả (dùng để tester giả lập lỗi hoặc độ trễ). Từ 2026-11-20: `code` là số nguyên **200–599** (Bun không cho 1xx làm response cuối, ngoài khoảng trước đây ra 500 kèm trang lỗi lộ đường dẫn), `time` 0–**30** giây, `msg` ≤ 500 ký tự; sai → 422. 204/205/304 không có body |
| GET | `/api/db/table` | Ẩn khỏi Swagger (`hide: true`), **cần token** từ 2026-11-20 (trước đó công khai). Chạy `SHOW TABLES`, trả mảng tên bảng. Frontend không dùng |
| GET | `/api/db/schema` | **Cần token**, có trong Swagger (tag *Database*), thêm 2026-11-20. Trả cấu trúc mọi bảng: `name`, `rows` (COUNT(*)), `columns[]` (`name, type, nullable, key, default, extra, references`). **Không** trả dữ liệu dòng. Frontend dùng ở `/db-management` |
| GET | `/swagger` | Swagger UI (Scalar), JSON ở `/swagger/json` |
| GET | `/view-file/*` | Xem file trong thư mục upload, công khai. Chặn path traversal (400 `Invalid path.`), header an toàn — xem [file.md](file.md) |
| GET | `/assets/*` | File tĩnh của frontend đã build (`backend/public/assets`), chỉ trong thư mục đó (ra ngoài → 404) |
| GET | `/*` | Catch-all, trả `backend/public/index.html` (SPA) |

## Swagger

- Scalar được tải từ CDN `cdn.jsdelivr.net`, nên **máy phải có mạng** thì Swagger mới hiện.
- Ô Server (2026-11-20): `regis.ts` xếp server theo `Bun.env.npm_lifecycle_event` — `bun run dev` để `http://localhost:<PORT>` lên đầu (mặc định), còn lại (`bun run start`) để `https://book.anhtester.com` lên đầu. Trước đó chỉ có production, nên Send từ Swagger local bị CORS chặn ("Failed to fetch"). Đã thử URL tương đối: `/` → Scalar ghép `//api/login` (404); `""` gọi được nhưng code mẫu thành `curl /api/login`. `swagger:export` luôn xếp production lên đầu trong `docs/api/openapi.json`.
- Link "Swagger API Documentation" trên trang chủ là `/swagger` (đường dẫn tương đối). Khi dev ở cổng 3039, Vite phải proxy `/swagger` thì link này mới chạy (đã thêm 2026-11-20).

## Xử lý lỗi chung

- Lỗi validation trả **422** dạng `{ msg: "Invalid data.", fields: { <field>: [<thông báo>] } }`. Schema có `error: "..."` hoặc `error: validationDetail("...")` thì thông báo đó được dùng thay câu mặc định của TypeBox (2026-11-20); thông báo trùng bị gộp.
- Lỗi khác (2026-11-20): route không có → 404 `{ msg: "Not found." }`; body hỏng → 400 `{ msg: "Invalid request body." }`; lỗi chưa bắt → 500 `{ msg: "Internal server error." }`, không trả lỗi thô / stack / trang lỗi của Bun.
- Lỗi `pattern` nằm trong `t.Union` không sinh được `fields` (ra `fields: {}`) → kiểm trong handler.
- Response có status > 300 được `console.log` ra terminal của backend.
- Mọi request `/api` đều được log dạng `[DD/MM/YYYY HH:mm:ss] METHOD: /path`.
