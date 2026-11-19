# Quản lý sách

Code: `backend/src/routers/book-controller.ts`
Frontend: `src/pages/book-mgt/` (`page.tsx`, `add-page.tsx`, `detail.tsx`). Route: `/book-management`, `/book-management/handle`, `/book-management/detail/:slug`.

## Endpoint

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/book` | Không | `page`, `limit`, `search`, `sort`, `sortBy`. Search chuỗi thường lọc trên `name`, `description`, `slug` |
| GET | `/api/book/{id}` | Không | `{id}` nhận **id hoặc slug**. Query `view=true` thì tăng `viewCount` |
| POST | `/api/book` | Có | `name`, `slug?`, `description`, `status`, `pictures[]`, `categories[]`, `price`, `promotions[]` |
| PATCH | `/api/book/{id}` | Có | Các field giống POST |
| DELETE | `/api/book/{id}` | Có | |

## Model `Book`

`name` (unique), `slug` (unique, tự `slugify` từ name nếu không gửi), `description` (TEXT), `picture` (TEXT), `viewCount`, `price`, `currentPrice`, `status` (`AVAILABLE` hoặc `UNAVAILABLE`), quan hệ n-n với `Category` và `Promotion`, `authId` trỏ tới người tạo.

## Lưu ý

- Ảnh lưu trong DB là **một chuỗi các tên file nối bằng dấu phẩy** (`picture`). API nhận và trả về dạng mảng `pictures` / `picture[]`. File ảnh nằm trong `upload/$book-image/`.
- `currentPrice` là giá sau khuyến mãi, tách riêng với `price`.
- Script seed `bun run fake` trỏ tới `src/fake.ts`, nhưng trên nhánh `deploy-vps` **file này không tồn tại**. Trên `main` script là `src/prisma-fake.ts`; nó lặp vô hạn và cần có sẵn category cùng user.
