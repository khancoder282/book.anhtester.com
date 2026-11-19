# Quản lý file

Code: `backend/src/routers/file-controller.ts`, kiểm tra đường dẫn / loại file / phục vụ file ở `backend/src/utils/upload-security.ts`. Prefix: `/api/file`. Thư mục gốc lưu file là `backend/<FILEDIR>` (mặc định `upload`).
Frontend: `src/pages/file-mgt/`. Route: `/file-management` (đang ẩn bằng `CONFIG.hiddenPaths` từ 2026-11-20, API vẫn công khai cho app mobile).

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/file` | **Tuỳ `path`** | `path` là **thư mục** (liệt kê, có `search`) → cần token, thiếu → 401. `path` là **một file** → công khai (ảnh bìa, avatar tải bằng `<img>`) |
| GET | `/api/file/info` | Không | `{ usedStorage, maxStorage }`. Tính bằng code (`dirSize`), chạy cả Windows lẫn Linux (trước đây gọi `du` → 500 trên Windows) |
| POST | `/api/file` | Có | `multipart/form-data`: `files[]` (1–20 file, tối đa **5MB mỗi file**), `path` (tạo thư mục nếu chưa có, kể cả nhiều cấp) |
| DELETE | `/api/file` | Có | Query `path` (lặp lại để xoá nhiều), xử lý **hết** các path (trước đây gặp thư mục là dừng) |
| PUT | `/api/file/rename` | Có | `{ path, name }` — `name` chỉ là tên, không có thư mục |
| POST | `/api/file/copy` | Có | `{ oldPath, newPath }` |
| PUT | `/api/file/move` | Có | `{ oldPath, newPath }` |

Xem/tải file: `GET /view-file/*` (công khai), route nằm ngoài `/api` và khai báo trong `src/index.ts`.

## Bảo mật (sửa 2026-11-20)

- **Đường dẫn:** mọi path từ client đi qua `resolveUpload()`: đổi `\` thành `/`, chặn ký tự điều khiển, ổ đĩa Windows (`C:`), UNC, rồi `path.resolve` và so prefix có dấu phân cách với thư mục upload. Sai → 400 `Invalid path.` (hoặc `Invalid path. Paths must be inside the upload directory.` ở delete/rename/copy/move). Không lộ đường dẫn server.
- Elysia **không** giải mã `params["*"]` (kể cả `%2F`, `%2E`) → `/view-file/*` giải mã đúng 1 lần rồi mới kiểm.
- **Tên file / tên mới:** `isValidName()` cấm `/ \ : * ? " < > |`, ký tự điều khiển, `.` và `..`.
- **Loại file upload:** chỉ jpg, jpeg, png, gif, webp, bmp, pdf, zip, rar, 7z, gz, tgz, bz2, tar, khi **đuôi và magic bytes khớp**; không tin `Content-Type` client gửi. SVG, HTML, txt... bị từ chối → 422 `{ msg: "Invalid data.", fields: { files: [...] } }`.
- Đổi tên / copy / move một **file** sang đuôi ngoài danh sách trên (+ `.txt .csv .md .svg` có sẵn trong seed) → 400 `File extension not allowed.`
- **Phục vụ file** (`serveFile`, dùng cho `/view-file/*` và `GET /api/file?path=<file>`): `Content-Type` theo đuôi (HTML/không rõ → `application/octet-stream`), `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox`, `Content-Disposition: inline` chỉ cho ảnh raster, còn lại `attachment`. SVG vẫn `image/svg+xml` nên `<img>` hiển thị được (`$image-404.svg`).
- Không đổi tên / move / xoá mục có tên bắt đầu bằng `$` (thư mục hệ thống) → 403.
- Kiểm token ở `GET /api/file` là bản chép của `plugins/auth.ts` (`checkToken`, gồm kiểm session `sid`) — sửa guard thì sửa cả hai.

## Lưu ý

- Lần chạy đầu, backend tự tạo `upload/`, `upload/$book-image/`, `upload/$avatar-image/` và copy `$image-404.svg` vào.
- Đường dẫn trả về (`paths`, `newPath`, `list[].path`) luôn dùng `/`, kể cả trên Windows (trước đây trả `\`).
- Frontend: dialog upload kiểm đuôi file và tối đa 20 tệp (khớp API). Ô ảnh bìa / avatar (`components/fields/upload-field.tsx`, `accepImg`) vẫn cho chọn `.svg` → API trả 422.
- Thư mục có tiền tố `$` là thư mục hệ thống (ảnh sách, avatar).
