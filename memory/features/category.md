# Category sách

Code: `backend/src/routers/category-controller.ts`. Prefix: `/api/category-book`. Frontend: màn riêng `/category-management` (`frontend/src/pages/category-mgt/page.tsx`, thêm 2026-11-20) và trong form/bộ lọc sách.

| Method | Path | Cần token | Body |
|---|---|---|---|
| GET | `/api/category-book` | Không | Không phân trang |
| POST | `/api/category-book` | Có | `{ name }` → 201; tên sai → 422; trùng → **409** |
| PUT | `/api/category-book` | Có | `{ name, newName }`: đổi tên. Không có `name` → 404; `newName` trùng → 409; `newName` sai → 422 |
| DELETE | `/api/category-book/{name}` | Có | Tên URL-encode; không có → 404 |

## Lưu ý

- Model `Category` **chỉ có `name` và `name` là khoá chính**. Không có id, nên đổi tên chính là đổi khoá chính, và xoá hay sửa đều theo tên.
- Tên có dấu cách hoặc ký tự đặc biệt thì phải URL-encode khi gọi DELETE.
- Quy tắc tên (frontend và API giống nhau từ 2026-11-20): trim, bắt buộc, tối đa **24** ký tự, không chứa `/`, không trùng (MySQL so không phân biệt hoa thường). API trả 422 `{ msg: "Invalid data.", fields: { name | newName: [...] } }`. Đã sửa bug `CATEGORY EXP01–EXP03`.
- Elysia giải mã path param nhưng **giữ nguyên `%2F`** → DELETE lấy tên từ URL gốc và giải mã 1 lần, nên category cũ có `/` vẫn xoá được.
- Tạo sách cũng tạo category (`connectOrCreate`/`createMany`) theo luật riêng của book-controller: chỉ chặn chuỗi rỗng, chưa áp trim / 24 ký tự / `/`.
- `GET` không phân trang, không nhận `limit`; Dashboard đếm bằng `pagination.total`.
- `Category.delete` ở frontend đã `encodeURIComponent` tên (2026-11-20).
