# Quản lý file

Code: `backend/src/routers/file-controller.ts`. Prefix: `/api/file`. Thư mục gốc lưu file là `backend/<FILEDIR>` (mặc định `upload`).
Frontend: `src/pages/file-mgt/`. Route: `/file-management`.

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/file` | Không | Query `path`, `search`. Liệt kê thư mục hoặc tìm file |
| GET | `/api/file/info` | Không | Trả `usedStorage` (dung lượng thư mục upload) |
| POST | `/api/file` | Có | `multipart/form-data`: `files[]` (tối đa **5MB mỗi file**), `path` |
| DELETE | `/api/file` | Có | Query `path` |
| PUT | `/api/file/rename` | Có | `{ path, name }` |
| POST | `/api/file/copy` | Có | `{ oldPath, newPath }` |
| PUT | `/api/file/move` | Có | `{ oldPath, newPath }` |

Xem/tải file: `GET /view-file/*`, route nằm ngoài `/api` và khai báo trong `src/index.ts`.

## Lưu ý

- Lần chạy đầu, backend tự tạo `upload/`, `upload/$book-image/`, `upload/$avatar-image/` và copy `$image-404.svg` vào.
- Đường dẫn được kiểm tra bằng `isInside()` để chặn `../`. Commit `d25e5bf` có sửa thêm phần kiểm tra path.
- Thư mục có tiền tố `$` là thư mục hệ thống (ảnh sách, avatar).
