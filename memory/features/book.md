# Quản lý sách

Code: `backend/src/routers/book-controller.ts`, quy tắc giá ở `backend/src/utils/pricing.ts`.
Frontend: `src/pages/book-mgt/` (`page.tsx`, `add-page.tsx`, `detail.tsx`). Route: `/book-management`, `/book-management/handle`, `/book-management/detail/:slug`.

## Endpoint

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/book` | Không | `page`, `limit`, `search`, `sort`, `sortBy`. Search chuỗi thường lọc trên `name`, `description`, `slug`, `author`, `publisher`, `isbn` (2026-11-20); JSON thì làm `where` (qua `plugins/filterTable.ts`, chặn cột nhạy cảm). Lỗi bộ lọc → 400 `{ msg, error }`, `error` là thông báo an toàn (không phải lỗi Prisma) |
| GET | `/api/book/{id}` | Không | `{id}` nhận **id hoặc slug**. Query `view=true` thì tăng `viewCount`. Trả thêm `slug` (2026-11-20) |
| POST | `/api/book` | Có | **201**. Bắt buộc `name`, `categories`; `price` mặc định 50.000, `status` mặc định AVAILABLE |
| PATCH | `/api/book/{id}` | Có | 200. Cập nhật một phần — xem dưới |
| DELETE | `/api/book/{id}` | Có | Xoá luôn file ảnh |

## Model `Book`

`name` (unique), `slug` (unique), `description` (TEXT), `picture` (TEXT), `viewCount`, `price` (Int), `currentPrice` (Int), `status` (`AVAILABLE` hoặc `UNAVAILABLE`), quan hệ n-n với `Category` và `Promotion`, `authId` trỏ tới người tạo.

**Thông tin thêm, không bắt buộc (2026-11-20)**, đều nullable: `author` (≤191), `publisher` (≤191), `publishYear` (Int 1000 – năm hiện tại), `pageCount` (Int 1 – 100.000), `isbn` (VarChar 13, lưu không gạch ngang), `language` (≤50). API: POST/PATCH nhận `null` hoặc chuỗi rỗng để xoá; chuỗi được trim. ISBN: bỏ khoảng trắng/gạch ngang, `x` → `X`, phải là ISBN-10 hoặc ISBN-13 **đúng chữ số kiểm tra** → sai thì 422 `fields.isbn`; `publishYear` lớn hơn năm hiện tại → 422 `fields.publishYear`. Không unique. GET list và detail trả đủ 6 trường; `sort` nhận thêm `author`, `publisher`, `publishYear`, `pageCount`. Code: `bookExtraSchemas`, `parseBookExtra` trong `book-controller.ts`. Seed đổ `author` từ `data.json`.

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
- Tạo sách lỗi thì frontend chỉ xoá các ảnh vừa upload (trước đây xoá cả thư mục `/$book-image/<slug>`, có thể là của sách khác trùng slug). Lỗi 422 có `fields` được gán vào từng ô của form (cả tạo và sửa) qua `setFieldErrors` trong `api/create-book.ts`: khoá API `pictures` đổi sang ô `picture` của form (trước 2026-11-21 lỗi ảnh không hiện, W23). Upload ảnh dùng timeout riêng `UPLOAD_TIMEOUT` 60s (axios mặc định 10s).
- Bộ lọc giá: "từ" + "đến" gộp thành một điều kiện `currentPrice: { gte, lte }`; ô trống gửi `null` (bỏ điều kiện).
- Script seed `bun run fake` trỏ tới `src/fake.ts`, nhưng trên nhánh `deploy-vps` **file này không tồn tại**.

## Form sách: khuyến mãi và thông tin thêm (2026-11-20)

- Thẻ **Thông tin thêm** (`components/card-more-info.tsx`) nằm giữa *Thuộc tính* và *Khuyến mãi*: 6 ô không bắt buộc. Validate phía form khớp API (năm 1000 – năm nay, số trang 1 – 100.000, ISBN đúng định dạng 10/13 ký tự); chữ số kiểm tra ISBN chỉ API kiểm, lỗi 422 gán vào ô qua `setError`. Ô trống gửi `null` (`utils/book-extra.ts`), nên PATCH luôn ghi đè 6 trường theo form.
- ⚠️ Locator: `[name="author"]` khớp thẻ `<meta name="author">` của trang trước ô nhập → dùng `input[name="author"]` hoặc `getByLabel`.
- Trang chi tiết (`detail.tsx`) hiện các trường có giá trị trong `dl[data-testid="book-more-info"]`, mỗi giá trị `dd[data-testid="book-<field>"]`.
- Thẻ **Khuyến mãi** (`card-promotion.tsx`): dưới chip có bảng giá — giá gốc, từng KM (trạng thái + mức giảm; KM chưa chạy thì mức giảm gạch ngang), *Giá bán hiện tại*, *Giá khi khuyến mãi sắp chạy bắt đầu* (chỉ hiện khi khác giá hiện tại), và `Alert` cảnh báo liệt kê KM chưa trừ vào giá (sắp chạy: ghi ngày bắt đầu; hết hạn; đã tắt). Lý do: danh sách chọn KM gồm cả KM **sắp chạy** (`endDate >= now`), trước đây chọn xong giá không đổi mà không có giải thích.
- Bấm chip KM (hoặc mã KM trong bảng giá) mở `PromotionDetailDialog` (`components/promotion-detail-dialog.tsx`): mã, tên, mô tả, loại, giá trị, thời gian, mức giảm cho sách này, nút *Mở trang khuyến mãi* (tab mới `/promotion-book-management/handle?id=`), *Bỏ khỏi sách*, *Đóng*.
- Tính giá phía form ở `utils/pricing.ts` (`calcCurrentPrice`, `calcUpcomingPrice`, `promotionStatus`), cùng quy tắc `backend/src/utils/pricing.ts`. API detail sách không trả `isActive` của KM (chỉ trả KM đang bật) nên `promotionStatus` coi thiếu `isActive` là đang bật.
- testid: `promotion-price-summary`, `promotion-price-row-<CODE>`, `promotion-current-price`, `promotion-upcoming-price`, `promotion-not-applied-warning`, `selected-promotion-<CODE>`, `promotion-detail-dialog`, `promotion-detail-<code|name|description|type|value|period|discount>`.

## Đọc thử + giao diện nhà sách (2026-11-21)

- Model thêm `previewTitle` (VarChar 191) và `previewContent` (Text, API giới hạn 20.000 ký tự vì TEXT MySQL 65.535 byte, chữ Việt tới 3 byte). Nhận qua POST/PATCH như 6 trường thông tin thêm (`parseBookExtra`, `null` / chuỗi rỗng = xoá, CRLF đổi thành LF). `GET /api/book/{id}` trả cả hai; `GET /api/book` chỉ trả `previewTitle` + `hasPreview` (lấy `previewContent` rồi bỏ đi trong `mappedList`).
- Định dạng nội dung: đoạn cách nhau bằng dòng trống, dòng bắt đầu `## ` là tiêu đề nhỏ (`parsePreview` trong `components/book-reader.tsx`).
- UI: xem `plans/mobile-sync.md#2026-11-21-03` (danh sách kiểu nhà sách, thẻ bìa 3D, chi tiết, trình đọc, lật trang khi rê chuột, sách cùng thể loại, thẻ form *Chương đọc thử*). Khách (chưa đăng nhập) chỉ thấy sách `AVAILABLE`, nên băng rôn cũng đếm theo điều kiện đó.
- Thẻ sách giữ id cũ `#book-<id>` (link tên) và `#img-book-<id>` (link bìa) cho test cũ.

## Ảnh sách tự xoá + phân trang (2026-11-21)

- `utils/book-images.ts`: ảnh sách chỉ được nằm trong `upload/$book-image/` (`checkPictures` → POST/PATCH sai thì 422 `fields.pictures`; đường dẫn chuẩn hoá `\` → `/`, có `/` đầu; cấm dấu phẩy vì DB lưu nối bằng dấu phẩy).
- `DELETE /api/book/{id}`: xoá sách rồi `removeBookImages` (chỉ file trong `$book-image`, không xoá file sách khác còn dùng, xoá thư mục rỗng đi lên tới `$book-image`). ⚠️ Trước đây là `rmSync(path.join(upload, p), { recursive: true })` không kiểm đường dẫn → sách có `pictures: ["/../src"]` xoá được cả thư mục code.
- `PATCH` có `pictures`: ảnh bị bỏ khỏi danh sách được xoá file. Frontend (`modify-book.ts`) vẫn gọi `DELETE /api/file` cho ảnh bỏ — xoá hai lần vô hại.
- `sweepOrphanBookImages` (gọi trong `index.ts` sau 30 giây khởi động + mỗi giờ, dùng `prisma` export từ `regis.ts`): xoá file trong `$book-image` không sách nào dùng và cũ hơn 24 giờ (ảnh upload rồi bỏ dở form).
- Trang Book: `BOOKS_PER_PAGE` = 20 (user chốt), `Pagination` + `?page=` trên URL; các setter trong `stores/filter.ts` xoá `page` khi đổi bộ lọc / sắp xếp. Bỏ cuộn tải thêm (36 cuốn, tối đa 10 lượt).
