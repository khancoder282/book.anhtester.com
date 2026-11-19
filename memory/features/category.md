# Category sách

Code: `backend/src/routers/category-controller.ts`. Prefix: `/api/category-book`. Frontend dùng trong form sách, không có trang riêng.

| Method | Path | Cần token | Body |
|---|---|---|---|
| GET | `/api/category-book` | Không | Không phân trang |
| POST | `/api/category-book` | Có | `{ name }` |
| PUT | `/api/category-book` | Có | `{ name, newName }`: đổi tên |
| DELETE | `/api/category-book/{name}` | Có | |

## Lưu ý

- Model `Category` **chỉ có `name` và `name` là khoá chính**. Không có id, nên đổi tên chính là đổi khoá chính, và xoá hay sửa đều theo tên.
- Tên có dấu cách hoặc ký tự đặc biệt thì phải URL-encode khi gọi DELETE.
