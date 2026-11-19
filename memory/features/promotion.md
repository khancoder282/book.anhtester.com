# Khuyến mãi (promotion)

Code: `backend/src/routers/promotion-controller.ts`. Prefix: `/api/promotion-book`.
Frontend: `src/pages/promotions-mgt/` (`page.tsx`, `handle.tsx`, `const-type.tsx`). Route: `/promotion-book-management`, `/promotion-book-management/handle`.

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/promotion-book` | Không | `page`, `limit`, `search`, `sort`, `sortBy` |
| GET | `/api/promotion-book/{id}` | Không | Trả kèm danh sách sách được áp dụng |
| POST | `/api/promotion-book` | Có | `code`, `name`, `description`, `type`, `value`, `startDate`, `endDate`, `isActive`, `books[]`, `configFe` |
| PATCH | `/api/promotion-book/{id}` | Có | Các field giống POST |
| DELETE | `/api/promotion-book/{id}` | Có | |

## Model `Promotion`

`code` (unique), `name`, `description` (TEXT), `type` (`PERCENTAGE` mặc định, `FIXED_AMOUNT`, `FREE_SHIPPING`), `value` (Float), `startDate`, `endDate`, `isActive`, quan hệ n-n với `Book`, `configFe` (chuỗi JSON, mặc định `"{}"`, frontend dùng để lưu cấu hình hiển thị).
