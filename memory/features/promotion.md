# Khuyến mãi (promotion)

Code: `backend/src/routers/promotion-controller.ts`. Prefix: `/api/promotion-book`. Quy tắc giá dùng chung: `backend/src/utils/pricing.ts` (xem [book.md](book.md)).
Frontend: `src/pages/promotions-mgt/` (`page.tsx`, `handle.tsx`, `const-type.tsx`). Route: `/promotion-book-management`, `/promotion-book-management/handle` (tạo), `/promotion-book-management/handle?id=<id>` (sửa).

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/promotion-book` | Không | `page`, `limit`, `search`, `sort`, `sortBy`. `pagination.lengthData` = số dòng trả về |
| GET | `/api/promotion-book/{id}` | Không | Trả kèm danh sách sách được áp dụng |
| POST | `/api/promotion-book` | Có | **201**. Bắt buộc `code`, `name`; `type` mặc định PERCENTAGE, `startDate` mặc định now, `endDate` mặc định start + 7 ngày, `isActive` mặc định true, `books` mặc định `[]` |
| PATCH | `/api/promotion-book/{id}` | Có | 200. Cập nhật một phần — xem dưới |
| DELETE | `/api/promotion-book/{id}` | Có | Tính lại giá các sách đang gắn |

## Model `Promotion`

`code` (unique), `name`, `description` (TEXT), `type` (`PERCENTAGE`, `FIXED_AMOUNT`, `FREE_SHIPPING`), `value` (Float), `startDate`, `endDate`, `isActive`, quan hệ n-n với `Book`, `configFe` (chuỗi JSON, mặc định `"{}"`).

## Quy tắc (từ 2026-11-20, sửa bug `PROMOTION EXP01`, `EXP02`)

- Validate (422 `{ msg, fields }`): `code`, `name` không trống; PERCENTAGE `0 < value <= 100`; FIXED_AMOUNT `value > 0`; FREE_SHIPPING bỏ qua `value`, lưu 0; `startDate < endDate`. Trùng mã → 422 "Promotion code already exists." (`fields.code`). Id sách không tồn tại → 404 "One or more books not found."; KM không tồn tại → 404 "Promotion not found.".
- API **không** bắt mã đủ 6 ký tự (dữ liệu mẫu có `GIAM20K`, `THIEUNHI15`…). Form web bắt 6 ký tự khi tạo / đổi mã, nhưng cho giữ nguyên mã cũ khi sửa.
- PATCH: trường không gửi giữ nguyên (không có `default`, `configFe` cũng giữ). Quy tắc kiểm trên bản đã gộp, nhưng chỉ báo lỗi cho phần request đụng tới (để vẫn tắt được bản ghi cũ đang sai). `books` gửi lên thì **thay thế** cả danh sách.
- Tạo / sửa / bật / tắt / xoá đều tính lại `currentPrice` của sách liên quan (sách cũ và mới).
- Search chuỗi thường: `contains` trên `code`, `name`, `description`; chuỗi trùng tên loại (`percentage`, `free shipping`…) khớp chính xác `type`. Không dùng `contains` trên cột enum (Prisma báo lỗi → trước đây `?search=a` trả 400).

## Frontend

- Menu *Edit* trong danh sách mở `handle?id=<id>`; `handle.tsx` nạp KM (`api/get-promotion-detail.ts`, lấy sách cùng dạng `BookView` qua `GET /api/book` để bảng chọn tick đúng), Lưu gọi `PATCH` (`api/update-promotion.ts`), Xoá gọi `deletePromotion` rồi về danh sách.
- Mở trang tạo thì form được `reset` về giá trị trống (form control là biến cấp module, trước đây còn giữ dữ liệu của lần sửa trước).
- Bảng chọn sách (`hooks/columns.tsx`): ảnh là `BookCover` bìa dọc 2:3 rộng 44px (2026-11-21). Đường dẫn ảnh trong DB (`/$book-image/...`) **luôn** phải qua `formatFilePath` (`BookCover` tự làm); đưa thẳng vào `src` thì ảnh lỗi, MUI chỉ hiện icon thay thế.
