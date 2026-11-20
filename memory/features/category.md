# Category sách

Code: `backend/src/routers/category-controller.ts`. Prefix: `/api/category-book`. Frontend: màn riêng `/category-management` (`frontend/src/pages/category-mgt/page.tsx`, thêm 2026-11-20) và trong form/bộ lọc sách.

| Method | Path | Cần token | Body |
|---|---|---|---|
| GET | `/api/category-book` | Không | Không phân trang. Mỗi dòng `{ name, isActive, bookCount }` |
| POST | `/api/category-book` | Có | `{ name, isActive? }` → 201 (`isActive` mặc định `true`); tên sai → 422; trùng → **409** |
| PUT | `/api/category-book` | Có | `{ name, newName?, isActive? }`: đổi tên và/hoặc bật/tắt. Không gửi cả hai → 422 `fields.newName`; không có `name` → 404; `newName` trùng → 409; `newName` sai → 422; `isActive` không phải boolean → 422 `fields.isActive` |
| DELETE | `/api/category-book/{name}` | Có | Tên URL-encode; không có → 404 |

## Trạng thái (Status, thêm 2026-11-20)

- Cột `Category.isActive Boolean @default(true)`. Bật/tắt bằng `PUT /api/category-book` `{ name, isActive }` (frontend: `Category.setStatus`).
- Category **tắt**: ẩn khỏi tab lọc ở trang Book (`filter-book.tsx`) và khỏi gợi ý trong ô Categories của form sách (`card-property.tsx`). **Không** ẩn sách, không chặn API: sách vẫn gắn được category tắt qua API, sách đã gắn vẫn giữ.
- Ngoại lệ: tab của category **đang chọn** (`?category=` trên URL) luôn hiện, kể cả khi tắt hoặc 0 sách, để link từ trang Category vẫn có tab được chọn.
- Màn Category: cột **Status** (đã đăng nhập: `Switch`, đổi ngay trên UI rồi gọi API, lỗi thì tải lại; khách: nhãn On/Off), sắp xếp được. Tên category tắt hiện màu nhạt.

## Bấm số sách → trang Book (thêm 2026-11-20)

- Số ở cột **Books** là link `/book-management?category=<tên đã encodeURIComponent>`. Trang Book đọc query `category` (`book-mgt/stores/filter.ts`) và lọc `categories.some.name.in`.
- Trang Book tự cuộn tab đang chọn vào tầm nhìn sau khi tải (`setTimeout` 300 ms, vì MUI Tabs hiện nút cuộn sau lần đo đầu nên tự cuộn thiếu). `Tabs value` là `false` khi danh sách chưa tải / category không tồn tại (tránh cảnh báo MUI).
- Locator: số sách `a[data-action="view-books"]` (aria-label `View <n> book(s) in "<tên>"`), công tắc `#status-<tên>` (role `switch`, aria-label `Turn status of "<tên>" on/off`), dòng có thêm `data-active="true|false"`.

## Lưu ý

- Model `Category` **chỉ có `name` và `name` là khoá chính**. Không có id, nên đổi tên chính là đổi khoá chính, và xoá hay sửa đều theo tên.
- Tên có dấu cách hoặc ký tự đặc biệt thì phải URL-encode khi gọi DELETE.
- Quy tắc tên (frontend và API giống nhau từ 2026-11-20): trim, bắt buộc, tối đa **24** ký tự, không chứa `/`, không trùng (MySQL so không phân biệt hoa thường). API trả 422 `{ msg: "Invalid data.", fields: { name | newName: [...] } }`. Đã sửa bug `CATEGORY EXP01–EXP03`.
- Elysia giải mã path param nhưng **giữ nguyên `%2F`** → DELETE lấy tên từ URL gốc và giải mã 1 lần, nên category cũ có `/` vẫn xoá được.
- Tạo sách cũng tạo category (`connectOrCreate`/`createMany`) theo luật riêng của book-controller: chỉ chặn chuỗi rỗng, chưa áp trim / 24 ký tự / `/`.
- `GET` không phân trang, không nhận `limit`; Dashboard đếm bằng `pagination.total`.
- `Category.delete` ở frontend đã `encodeURIComponent` tên (2026-11-20).

- Dòng tổng `#category-summary` (2026-11-21): đang gõ tìm thì đổi thành "x / tổng danh mục · y / tổng lượt gắn sách" theo kết quả lọc (khoá i18n `category.summaryFiltered`); ô tìm trống thì như cũ.
