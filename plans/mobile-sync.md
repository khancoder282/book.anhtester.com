# Thay đổi cần đồng bộ sang app mobile

Repo mobile: `../mobile-book.anhtester.com`. Đây là app Capacitor dùng **gần như cùng mã nguồn React** với `frontend/` (cùng cấu trúc `src/pages`, `src/layouts`, `src/routes`), nên phần lớn thay đổi UI có thể chép file sang rồi chỉnh layout cho màn hình nhỏ.

> ⚠️ App mobile gọi API **production** `https://book.anhtester.com`, không gọi backend local. Thay đổi backend (API mới, API đổi) chỉ tới được app mobile **sau khi deploy backend lên production**. Cột *Cần deploy backend* cho biết mục nào phụ thuộc việc này.

## Tóm tắt

| Mã | Ngày | Thay đổi | Đổi API? | Cần deploy backend | Mobile |
|---|---|---|---|---|---|
| [2026-11-20-01](#2026-11-20-01) | 2026-11-20 | Màn Category riêng | Không (dùng API có sẵn), sửa cách gọi DELETE | Không | ⏳ Chưa làm |
| [2026-11-20-02](#2026-11-20-02) | 2026-11-20 | Màn Database xem cấu trúc bảng | **Có**: thêm `GET /api/db/schema` | **Có** | ⏳ Tuỳ chọn (mobile chưa có màn Database) |
| [2026-11-20-03](#2026-11-20-03) | 2026-11-20 | Ảnh bìa mặc định cho sách | Không | Không | ⏳ Chưa làm |
| [2026-11-20-04](#2026-11-20-04) | 2026-11-20 | Dữ liệu Address theo đơn vị hành chính hiện hành | Không đổi hình dạng; dữ liệu + thứ tự trả về đổi | **Có** (+ nạp dữ liệu trên VPS) | Không cần sửa code |

---

<a id="2026-11-20-01"></a>
## 2026-11-20-01 · Màn Category riêng

**Web đã làm**

- Route mới `/category-management`, mục menu **Category** (icon `ic-blog`) nằm giữa Book và Promotion.
- Màn gồm: ô tìm (lọc phía client), bảng 2 cột *Name*, *Books* (số sách), sắp xếp theo cả hai cột, dòng tóm tắt `N categories · M book links`, nút *New category*, mỗi dòng có nút đổi tên và xoá.
- Validation phía client (tạo và đổi tên): bắt buộc, không toàn khoảng trắng, tối đa **24 ký tự** (khớp ô Category trong form sách), không chứa `/`, không trùng tên đã có (**không phân biệt hoa thường**), tên mới phải khác tên cũ.
- Xoá category có sách: hộp xác nhận báo số sách sẽ mất category này (sách không bị xoá).
- Sửa `Category.delete` trong `src/pages/book-mgt/api/categorys.ts`: tên category được `encodeURIComponent` trước khi ghép vào URL (tên có dấu cách, ký tự đặc biệt).

**API dùng** (không đổi): `GET/POST/PUT /api/category-book`, `DELETE /api/category-book/{name}`. Xem `memory/features/category.md`.

**Locator cho test** (id / aria-label): `#btn-new-category`, `#search-category`, `#category-summary`, `#table-category`, dòng `tr[data-category="<tên>"]`, nút `[aria-label="Rename <tên>"]`, `[aria-label="Delete <tên>"]`, ô nhập `#category-name` (tạo) và `#category-new-name` (đổi tên), nút trong dialog `#dialog-form-action`, `#dialog-delete-action`.

**File bên web → file tương ứng bên mobile**

| Web (`frontend/src/`) | Mobile (`src/`) | Việc |
|---|---|---|
| `pages/category-mgt/page.tsx` | `pages/category-mgt/page.tsx` | Chép sang. Trên màn hẹp có thể cần đổi bảng thành danh sách |
| `routes/sections.tsx` | `routes/sections.tsx` | Thêm route `category-management` |
| `layouts/nav-config-dashboard.tsx` | `layouts/nav-config-dashboard.tsx` | Thêm mục Category |
| `pages/book-mgt/api/categorys.ts` | `pages/book-mgt/api/categorys.ts` | Thêm `encodeURIComponent` cho `delete` |

---

<a id="2026-11-20-02"></a>
## 2026-11-20-02 · Màn Database xem cấu trúc bảng

**Web đã làm**

- Màn `/db-management` trước đây chỉ là `iframe` không có `src` (trang trắng). Nay gồm: danh sách bảng (tên, số cột, số dòng) bên trái, bảng chi tiết cột bên phải (*Column, Type, Nullable, Key, Default, References*). Bấm khoá ngoại để nhảy sang bảng được tham chiếu. Bảng đang chọn nằm trên URL `?table=<tên>` nên mở thẳng link được. Có nút *Reload*.
- **Chỉ hiện cấu trúc, không hiện dữ liệu từng dòng**, để không lộ hash mật khẩu, refresh token.

**API mới**: `GET /api/db/schema` (cần token, có trong Swagger nhóm *Database*). Trả mảng:

```json
[
  {
    "name": "book",
    "rows": 20,
    "columns": [
      { "name": "authId", "type": "varchar(191)", "nullable": true, "key": "MUL",
        "default": null, "extra": "", "references": "user.id" }
    ]
  }
]
```

`key` là `PRI` / `UNI` / `MUL` / rỗng. `references` dạng `bảng.cột` hoặc `null`. `GET /api/db/table` (danh sách tên bảng, không cần token) giữ nguyên.

**Locator cho test**: `#db-summary`, `#btn-reload-schema`, `#db-table-list`, mục bảng `[data-table="<tên>"]`, `#db-table-title`, `#db-column-table`, dòng cột `tr[data-column="<tên>"]`.

**Mobile**: chưa có màn Database. Chỉ làm nếu muốn thêm màn này. Phải deploy backend lên production trước vì app gọi API production.

| Web | Mobile | Việc |
|---|---|---|
| `frontend/src/pages/db-mgt/page.tsx` | `src/pages/db-mgt/page.tsx` (chưa có) | Chép sang, bố cục 2 cột nên đổi thành chọn bảng ở trên, danh sách cột ở dưới |
| `backend/src/routers/database-controller.ts` | — | Deploy backend |

---

<a id="2026-11-20-03"></a>
## 2026-11-20-03 · Ảnh bìa mặc định cho sách

**Web đã làm**

- Component mới `pages/book-mgt/components/book-cover.tsx` (`BookCover`): có ảnh thì hiện ảnh, **không có ảnh hoặc ảnh tải lỗi** thì hiện bìa mặc định gồm nền gradient (màu chọn theo tên sách, mỗi sách luôn ra cùng một màu), icon sách và tên sách tối đa 2 dòng. Bìa mặc định có `role="img"`, `aria-label="<tên> (no cover image)"`, `data-cover="placeholder"`.
- Trước đây thẻ sách lấy `/$image-404.svg` trong thư mục upload. File này nằm trong `backend/upload` (đã gitignore), máy mới clone về không có, nên ảnh bị trống.
- Dùng `BookCover` ở: thẻ sách (`card-book-view.tsx`), thẻ sách lớn có carousel (`card-book-view-smoll.tsx`, khi không có ảnh thì không dựng carousel rỗng), trang chi tiết (`detail.tsx`).
- `detail.tsx`: lọc bỏ phần tử ảnh có `path` rỗng (API chi tiết trả về một "ảnh" rỗng khi sách không có ảnh, xem bug `BOOK EXP07`), xoá `console.log(data.picture)`.
- Link bao quanh ảnh đặt `textDecoration: 'none'` để tên sách trên bìa mặc định không bị gạch chân.

**API**: không đổi. Bug `BOOK EXP07` vẫn còn ở API, UI chỉ bỏ qua phần tử rỗng.

| Web (`frontend/src/`) | Mobile (`src/`) | Việc |
|---|---|---|
| `pages/book-mgt/components/book-cover.tsx` | cùng đường dẫn | Chép sang |
| `pages/book-mgt/components/card-book-view.tsx` | cùng đường dẫn | Thay `CardMedia` + `/$image-404.svg` bằng `BookCover` |
| `pages/book-mgt/components/card-book-view-smoll.tsx` | cùng đường dẫn | Dùng `BookCover`, không dựng carousel khi không có ảnh |
| `pages/book-mgt/detail.tsx` | cùng đường dẫn | Lọc ảnh rỗng, hiện `BookCover`, xoá `console.log` |

---

<a id="2026-11-20-04"></a>
## 2026-11-20-04 · Dữ liệu Address theo đơn vị hành chính hiện hành

**Web đã làm**

- Bảng `Address` nạp đủ **34 tỉnh/thành phố, 3.321 phường/xã/đặc khu** theo hệ thống hành chính 2 cấp từ 01/07/2025 (trước đây seed chỉ có 6 thành phố, 31 phường). Dữ liệu ở `backend/prisma/seed/vn-address.json`.
- Script mới `bun run seed:address --yes` chỉ thay bảng Address. `bun run seed` dùng chung dữ liệu này.
- UI không đổi: ô *Division* / *Ward* trong form user (`components/fields/address-field.tsx`) tự có danh sách mới.

**API**: hình dạng không đổi (`string[]`). Thay đổi:
- `GET /api/address`: trả 34 tỉnh theo **thứ tự mã hành chính** (Thành phố Hà Nội → Tỉnh Cà Mau) thay vì thứ tự ngẫu nhiên của `groupBy`.
- `GET /api/address/{divname}`: thứ tự theo mã hành chính. Tên tỉnh cũ (VD `Tỉnh Hà Giang`, `Tỉnh Bình Dương`) giờ trả `[]`.
- Swagger: thêm `summary` và mô tả chi tiết cho 2 endpoint.

**Locator cho test**: không đổi (`#address-division`, `#address-ward`, `#address`).

**Mobile cần làm**

- Không cần sửa code: `address-field.tsx` bên mobile gọi cùng API.
- App gọi API production nên phải: deploy backend (`address-controller.ts`) **và** chạy `cd backend && bun run seed:address --yes --allow-remote` trên VPS. Chưa chạy thì app vẫn thấy dữ liệu cũ trên production.
- Test mobile nào hard-code tên tỉnh/phường cũ (cấp huyện, tỉnh đã sáp nhập) thì đổi sang tên mới.

| Web | Mobile | Việc |
|---|---|---|
| `backend/prisma/seed/vn-address.json`, `address.ts` | — | Nạp dữ liệu trên VPS |
| `backend/src/routers/address-controller.ts` | — | Deploy backend |
