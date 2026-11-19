# Category sách

Code: `backend/src/routers/category-controller.ts`. Prefix: `/api/category-book`. Frontend: màn riêng `/category-management` (`frontend/src/pages/category-mgt/page.tsx`, thêm 2026-11-20) và trong form/bộ lọc sách.

| Method | Path | Cần token | Body |
|---|---|---|---|
| GET | `/api/category-book` | Không | Không phân trang |
| POST | `/api/category-book` | Có | `{ name }` |
| PUT | `/api/category-book` | Có | `{ name, newName }`: đổi tên |
| DELETE | `/api/category-book/{name}` | Có | |

## Lưu ý

- Model `Category` **chỉ có `name` và `name` là khoá chính**. Không có id, nên đổi tên chính là đổi khoá chính, và xoá hay sửa đều theo tên.
- Tên có dấu cách hoặc ký tự đặc biệt thì phải URL-encode khi gọi DELETE.
- Frontend (2026-11-20) validate phía client: bắt buộc, tối đa 24 ký tự, không chứa `/`, không trùng (không phân biệt hoa thường). API **không** validate những điều này (bug `CATEGORY EXP01`, `EXP02`), nên test API vẫn tái hiện được.
- `Category.delete` ở frontend đã `encodeURIComponent` tên (2026-11-20).
