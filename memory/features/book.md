# Quản lý sách

Code: `backend/src/routers/book-controller.ts`, quy tắc giá ở `backend/src/utils/pricing.ts`.
Frontend: `src/pages/book-mgt/` (`page.tsx`, `add-page.tsx`, `detail.tsx`). Route: `/book-management`, `/book-management/handle`, `/book-management/detail/:slug`.

## Endpoint

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/book` | Không | `page`, `limit`, `search`, `sort`, `sortBy`. Search chuỗi thường lọc trên `name`, `description`, `slug`; JSON thì làm `where` (qua `plugins/filterTable.ts`, chặn cột nhạy cảm). Lỗi bộ lọc → 400 `{ msg, error }`, `error` là thông báo an toàn (không phải lỗi Prisma) |
| GET | `/api/book/{id}` | Không | `{id}` nhận **id hoặc slug**. Query `view=true` thì tăng `viewCount`. Trả thêm `slug` (2026-11-20) |
| POST | `/api/book` | Có | **201**. Bắt buộc `name`, `categories`; `price` mặc định 50.000, `status` mặc định AVAILABLE |
| PATCH | `/api/book/{id}` | Có | 200. Cập nhật một phần — xem dưới |
| DELETE | `/api/book/{id}` | Có | Xoá luôn file ảnh |

## Model `Book`

`name` (unique), `slug` (unique), `description` (TEXT), `picture` (TEXT), `viewCount`, `price` (Int), `currentPrice` (Int), `status` (`AVAILABLE` hoặc `UNAVAILABLE`), quan hệ n-n với `Category` và `Promotion`, `authId` trỏ tới người tạo.

## Quy tắc (từ 2026-11-20, sửa bug `BOOK EXP01`–`EXP08`)

- **Giá bán** `currentPrice` = `price` trừ mức giảm của các khuyến mãi **đang hiệu lực** gắn với sách (`isActive` và `startDate <= now <= endDate`); PERCENTAGE giảm `price*value/100`, FIXED_AMOUNT giảm `value`, FREE_SHIPPING không đổi giá; nhiều KM thì cộng dồn; làm tròn, kẹp trong `[0, price]`. Hàm dùng chung: `calcCurrentPrice`, `recalcBookPrices`, `syncStaleBookPrices` trong `utils/pricing.ts`.
- Tính lại khi: tạo / PATCH sách, tạo / sửa / bật / tắt / xoá KM. Ngoài ra `GET /api/book` và `GET /api/book/{id}` gọi `syncStaleBookPrices` trước khi đọc, để KM tới ngày bắt đầu / hết hạn tự cập nhật giá đã lưu (sort và lọc theo `currentPrice` vẫn đúng). Cập nhật giá kiểu này **giữ nguyên `updatedAt`**.
- `price`: số nguyên 0 – 1.000.000.000 (`MAX_BOOK_PRICE`; cột Int của MySQL tối đa ~2,1 tỷ). Form web: tối thiểu 1.000, tối đa 1 tỷ, phải là số nguyên.
- PATCH: trường không gửi giữ nguyên (schema PATCH không có `default`). `categories` / `promotions` gửi lên thì **thay thế** cả danh sách (`promotions: []` gỡ hết). `pictures` gửi lên thì thay toàn bộ ảnh. Đổi `name` không tự đổi `slug`.
- `categories` (POST/PATCH): trim, bỏ trùng (không phân biệt hoa thường), khớp category đã có theo tên đang lưu. Tên **mới** (sẽ tạo kèm) theo luật của `category-controller.ts`: bắt buộc, ≤ 24 ký tự, không chứa `/` → 422 `fields.categories` (2026-11-20). Tên đã có trong DB thì không kiểm lại (dữ liệu cũ vẫn dùng được).
- `slug` luôn được chuẩn hoá: `đ/Đ` → `d`, bỏ dấu, `_` và khoảng trắng → `-`, bỏ ký tự khác, cắt `-` hai đầu. Rỗng → 422 `fields.slug`.
- Lỗi: tên trống → 422 `fields.name`; trùng tên → 422 "Book name already exists." (`fields.name`); trùng slug → 422 "Slug already exists." (`fields.slug`) — so theo collation của DB (không phân biệt hoa thường); id KM không tồn tại → 404 "Promotion not found."; sách không tồn tại → 404.
- ⚠️ `t.UnionEnum` của Elysia **tự gán `default` = giá trị đầu tiên**, kể cả trong `t.Optional`. Schema PATCH phải dùng `t.Union([t.Literal(...)])`, nếu không PATCH sẽ ghi đè `status`/`type`. `t.Integer` của Elysia là union với chuỗi số, thông báo lỗi khó đọc ("should be one of 'integer'") → dùng `t.Number({ multipleOf: 1 })`.

## Lưu ý

- Ảnh lưu trong DB là **một chuỗi các tên file nối bằng dấu phẩy** (`picture`). API nhận `pictures[]`, trả `picture[]`; chỉ trả file thực sự tồn tại (sách không ảnh → `[]`). File ảnh nằm trong `upload/$book-image/`.
- Ảnh bìa trên UI đi qua `frontend/src/pages/book-mgt/components/book-cover.tsx`: không có ảnh hoặc ảnh lỗi thì vẽ bìa mặc định (`data-cover="placeholder"`).
- Form sửa sách chỉ nạp KM còn hiệu lực (API detail lọc `isActive` + chưa hết hạn), nên `modify-book.ts` **chỉ gửi `promotions` khi người dùng đổi** (`getFieldState('promotions').isDirty`), tránh gỡ mất KM đang tắt / đã hết hạn.
- Tạo sách lỗi thì frontend chỉ xoá các ảnh vừa upload (trước đây xoá cả thư mục `/$book-image/<slug>`, có thể là của sách khác trùng slug). Lỗi 422 có `fields` được gán vào từng ô của form (cả tạo và sửa).
- Bộ lọc giá: "từ" + "đến" gộp thành một điều kiện `currentPrice: { gte, lte }`; ô trống gửi `null` (bỏ điều kiện).
- Script seed `bun run fake` trỏ tới `src/fake.ts`, nhưng trên nhánh `deploy-vps` **file này không tồn tại**.
