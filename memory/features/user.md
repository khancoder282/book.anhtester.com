# Quản lý user

Code: `backend/src/routers/user-controller.ts`
Frontend: `src/pages/user-mgt/` (`index.tsx`, `columns.tsx`, `add-user-dialog.tsx`). Route: `/user-management`, `/user-management/my-profile`, `/user-management/setting-account`.

## Endpoint

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/user` | **Không** | Query: `page`, `limit`, `search`, `sort`, `sortBy`. Trả `{ list, pagination: { total, totalPage, currentPage, lengthData } }` |
| GET | `/api/user/{id}` | **Không** | Chi tiết một user |
| POST | `/api/user` | Có | `name`, `email`, `password`, `avatarUrl`, `address`, `phone`, `isActive` |
| PATCH | `/api/user/{id}` | Có | Các field giống POST, đều tuỳ chọn |
| DELETE | `/api/user/{id}` | Có | |

## Model `User`

`id` (cuid), `name`, `email` (unique), `password`, `avatarUrl` (TEXT), `isActive` (mặc định true), `phone`, `address` (TEXT), `config` (JSON, nullable), `createdAt`, `updatedAt`.

## Lưu ý

- `search` có thể là chuỗi thường, khi đó lọc `contains` trên các cột định sẵn. Nó cũng có thể là **chuỗi JSON**, khi đó được dùng thẳng làm `where` của Prisma (`plugins/filterTable.ts`). Kết hợp với việc GET không cần token, đây là lỗ hổng: xem [../notes/security.md](../notes/security.md).
- Response không trả field `password`.
- Đặt `isActive = false` sẽ khiến user đó bị 403 ở mọi API cần token.
