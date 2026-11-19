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
| [2026-11-20-05](#2026-11-20-05) | 2026-11-20 | Khuyến mãi: giá trị có đơn vị, trạng thái theo ngày | Không | Không | ⏳ Chưa làm |
| [2026-11-20-06](#2026-11-20-06) | 2026-11-20 | Đa ngôn ngữ vi / en + nút chuyển | Không | Không | ⏳ Chưa làm (việc lớn nhất) |
| [2026-11-20-07](#2026-11-20-07) | 2026-11-20 | Tiêu đề tab đổi ngay khi chuyển trang | Không | Không | ⏳ Chưa làm |
| [2026-11-20-08](#2026-11-20-08) | 2026-11-20 | Ẩn màn File và Database | Không | Không | ⏳ Chưa làm (ẩn màn File bên mobile) |
| [2026-11-20-09](#2026-11-20-09) | 2026-11-20 | Trang Cần trợ giúp (`/help`) | Không | Không | ⏳ Chưa làm |
| [2026-11-20-10](#2026-11-20-10) | 2026-11-20 | Sửa bug Auth + User (token, phiên, chỉ sửa chính mình) | **Có**, nhiều chỗ | **Có** | ⏳ Chưa làm — **ảnh hưởng đăng nhập của app** |
| [2026-11-20-11](#2026-11-20-11) | 2026-11-20 | Sửa bug Book + Promotion (PATCH một phần, giá bán, validate) | **Có** | **Có** | ⏳ Chưa làm |
| [2026-11-20-12](#2026-11-20-12) | 2026-11-20 | Sửa bug File + System + Category (đường dẫn, loại file, token) | **Có** | **Có** | ⏳ Chưa làm |
| [2026-11-20-14](#2026-11-20-14) | 2026-11-20 | Swagger: server mặc định theo môi trường | Không (chỉ đổi danh sách `servers` của tài liệu) | Không bắt buộc | Không cần làm |

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

---

<a id="2026-11-20-05"></a>
## 2026-11-20-05 · Khuyến mãi: giá trị có đơn vị, trạng thái theo ngày

**Web đã làm**

- File mới `pages/promotions-mgt/utils.ts`:
  - `formatPromotionValue(p)`: `PERCENTAGE` → `20%`, `FIXED_AMOUNT` → `50.000 ₫`, `FREE_SHIPPING` → `Free shipping` / `Miễn phí ship`.
  - `getPromotionStatus(p)`: `isActive = false` → **Disabled / Đã tắt**; chưa tới `startDate` → **Scheduled / Sắp chạy**; quá `endDate` → **Expired / Hết hạn**; còn lại → **Running / Đang chạy**. Màu nhãn ở `PROMOTION_STATUS_COLOR`.
- Bảng khuyến mãi (`hooks/columns-main.tsx`): cột *Active* đổi thành cột **Status** (vẫn sắp xếp theo `isActive`), cột *Value* có đơn vị, cột *Type* hiện tên dễ đọc thay vì `PERCENTAGE`.
- Bảng khuyến mãi trong form sách (`book-mgt/columns-promotion.tsx`): cột Value và Type giống trên.
- Sửa lỗi hiển thị: cột *Created* trước đây hiện `endDate`, nay hiện `createdAt`.

**Locator cho test**: nhãn trạng thái `[data-status="disabled|scheduled|running|expired"]`, nhãn giá trị `[data-promotion-value="<số gốc>"]` (giữ giá trị số để assert không phụ thuộc định dạng).

| Web (`frontend/src/`) | Mobile (`src/`) | Việc |
|---|---|---|
| `pages/promotions-mgt/utils.ts` | cùng đường dẫn | Chép sang |
| `pages/promotions-mgt/hooks/columns-main.tsx` | cùng đường dẫn | Cột Status, Value, Type, Created |
| `pages/book-mgt/columns-promotion.tsx` | cùng đường dẫn | Cột Value, Type |

---

<a id="2026-11-20-06"></a>
## 2026-11-20-06 · Đa ngôn ngữ vi / en + nút chuyển

**Web đã làm**

- Hạ tầng `src/locales/` (không thêm thư viện): store `useLangStore`, hook `useTranslate()` → `{ t, lang, setLang }`, hàm `translate()` cho code ngoài component. Từ điển 11 namespace, mỗi namespace một cặp `en/<ns>.ts` + `vi/<ns>.ts`, khoảng 420 khoá. Khoá có kiểu chặt: sai khoá, hoặc bản `vi` thiếu/thừa khoá so với `en`, là lỗi TypeScript. Chi tiết: `memory/features/i18n.md`.
- Ngôn ngữ chọn theo thứ tự `?lang=vi|en` → `localStorage['lang']` → mặc định **`en`**. Đổi ngôn ngữ không cần tải lại trang; đổi luôn locale của dayjs (`19 Nov 2026` / `19 Thg 11 2026`), MUI date picker và `<html lang>`.
- Nút chuyển `layouts/components/language-popover.tsx` ở header dashboard (cạnh avatar) và header trang sign-in / sign-up.
- Đã dịch: menu, menu tài khoản, Dashboard, 404, Sign in, Sign up, User (danh sách, form, profile, setting), Book (danh sách, lọc, sắp xếp, form, chi tiết), Category, Promotion (danh sách, form), File, Database, component dùng chung (bảng, phân trang, bộ lọc, dialog xác nhận, upload, date picker, toast mặc định).
- **Chữ tiếng Anh giữ nguyên văn** như trước (kể cả lỗi chính tả có sẵn), để test cũ bám theo chữ không bị gãy.
- **Không dịch**: message trả về từ backend (toast sau khi gọi API vẫn tiếng Anh ở cả hai chế độ), dữ liệu người dùng, giá trị gửi API (giá trị `?sort=` trên URL vẫn là `Newest`, `Feature`…), mã HTTP trên Dashboard, ảnh banner.
- Ô địa chỉ `components/fields/address-field.tsx` (khung *Address*, ô *Division*, *Ward*, *Address*): dịch bổ sung sau (vi: *Địa chỉ*, *Tỉnh / Thành phố*, *Phường / Xã*, *Số nhà, tên đường*). Chữ mặc định của mọi MUI `Autocomplete` (*No options*, *Loading…*, nút Open / Close / Clear) đặt một lần trong theme ở `app.tsx` (`components.MuiAutocomplete.defaultProps`), khoá `components.autocomplete.*`.
- Hạn chế đã biết: thông báo validation đang hiện, hoặc dialog đang mở, giữ ngôn ngữ cũ cho tới lần validate / mở lại tiếp theo.
- Sửa kèm: Dashboard date picker trước đây luôn hiện thứ tiếng Việt (T2…CN) kể cả ở tiếng Anh; nay theo ngôn ngữ. Đổi tên vài biến theme `t` → `theme` để không trùng `t` của i18n (ESLint `no-shadow`).

**Locator cho test**: `#btn-language`, menu `#menu-language`, mục `[data-lang="en"]`, `[data-lang="vi"]`. Test muốn chạy tiếng Việt thì mở URL kèm `?lang=vi`. Locator theo `id`, `name`, `data-*` không đổi; locator theo chữ hoặc `aria-label` chỉ đúng ở ngôn ngữ đã viết. Màn Category thêm `data-action="rename|delete"` để không phụ thuộc `aria-label`.

**Mobile cần làm**

- Chép nguyên thư mục `src/locales/` và `layouts/components/language-popover.tsx`, đặt nút vào header của `layouts/mobile-layout` (hoặc menu tài khoản nếu header chật).
- `app.tsx`: bỏ `dayjs.locale('vi')` cứng, `adapterLocale={lang}` (xem bản web).
- Với từng màn đã có bên mobile (book, user, promotion, file, home, sign-in), so diff bản web và chép phần thay chuỗi; cấu trúc file giống nhau nên phần lớn chép được nguyên file, chỉ giữ lại chỗ mobile đã chỉnh layout riêng.
- Chuỗi chỉ có ở mobile (`mobile-layout/footer.tsx`…) thì thêm khoá vào namespace `nav` hoặc `components`.

| Web (`frontend/src/`) | Mobile (`src/`) | Việc |
|---|---|---|
| `locales/**` | `locales/**` | Chép sang |
| `layouts/components/language-popover.tsx` | cùng đường dẫn | Chép sang, gắn vào header mobile |
| `app.tsx`, `components/title/index.tsx` | cùng đường dẫn | Locale động, chữ mặc định Autocomplete trong theme, tiêu đề tab (mục 07) |
| `layouts/nav-config-*.tsx`, `layouts/dashboard/nav.tsx`, `layouts/components/account-popover.tsx`, `layouts/auth/layout.tsx` | cùng đường dẫn | Menu dùng khoá dịch |
| `components/{buttons,dialog-confirm,fields,grid-view,toast}/**` | cùng đường dẫn | Chép phần thay chuỗi |
| `pages/{home,sign-in,user-mgt,book-mgt,promotions-mgt,file-mgt,not-found-view}/**` | cùng đường dẫn | Chép phần thay chuỗi |
| `routes/hooks/use-auth-check.ts` | cùng đường dẫn | Toast "Please login first" |

---

<a id="2026-11-20-07"></a>
## 2026-11-20-07 · Tiêu đề tab đổi ngay khi chuyển trang

**Web đã làm**

- `app.tsx` → `useRouteTitle()`: khi đổi route, đặt ngay tiêu đề theo mục menu khớp đường dẫn (vd `Book - Book UI for …`, tiếng Việt `Sách - …`), bằng `useLayoutEffect`, trước khi trang lazy tải xong. `/sign-in`, `/sign-up` có tiêu đề riêng.
- `components/title/index.tsx`: `<Title>` của trang phụ thuộc thêm `pathname`, và vì là `useEffect` nên luôn chạy sau, ghi đè bằng tiêu đề chi tiết của trang.
- `index.html` vẫn giữ `<title>` SEO, chỉ thấy trong tích tắc lúc tải trang lần đầu.

| Web (`frontend/src/`) | Mobile (`src/`) | Việc |
|---|---|---|
| `app.tsx` | cùng đường dẫn | Thêm `useRouteTitle` |
| `components/title/index.tsx` | cùng đường dẫn | Chép sang |

---

<a id="2026-11-20-08"></a>
## 2026-11-20-08 · Ẩn màn File và Database

**Web đã làm**

- `config-global.ts`: thêm `CONFIG.hiddenPaths = [/file-management, /db-management]` và hàm `isHiddenPath()`.
- `layouts/nav-config-dashboard.tsx`: menu bỏ các mục trong `hiddenPaths`. `routes/sections.tsx`: bỏ route tương ứng, mở thẳng URL ra trang 404.
- Code của hai màn và API backend (`/api/file*`, `/api/db/*`) **giữ nguyên**. Bật lại: xoá đường dẫn khỏi `hiddenPaths`.
- Dashboard: câu giới thiệu không còn nhắc quản lý file.

**Mobile cần làm**: mobile có màn File (chưa có màn Database) → ẩn tương tự: chép `config-global.ts` (phần `hiddenPaths`, `isHiddenPath`), lọc `navData` và route. Ảnh avatar / ảnh bìa vẫn tải qua API file như cũ.

| Web (`frontend/src/`) | Mobile (`src/`) | Việc |
|---|---|---|
| `config-global.ts` | cùng đường dẫn | Thêm `hiddenPaths`, `isHiddenPath` |
| `layouts/nav-config-dashboard.tsx`, `routes/sections.tsx` | cùng đường dẫn | Lọc menu và route |
| `locales/{en,vi}/home.ts` | cùng đường dẫn | Câu giới thiệu Dashboard |

---

<a id="2026-11-20-09"></a>
## 2026-11-20-09 · Trang Cần trợ giúp (`/help`)

**Web đã làm**

- Route công khai mới `/help` (không cần đăng nhập), dùng `AuthLayout`. Link "Need help?" / "Cần trợ giúp?" ở header trang sign-in / sign-up trước đây là `href="#"`, nay mở `/help`.
- Nội dung: thông tin liên hệ Anh Tester theo https://anhtester.com/contact — điện thoại, email, Zalo, website; nút Facebook, YouTube, Telegram, LinkedIn, GitHub, Discord; 8 nhóm cộng đồng (Zalo, Facebook, Telegram); nút *Quay lại đăng nhập*.
- Namespace i18n mới `help`, tiêu đề tab `Need help? - …` / `Cần trợ giúp? - …`.
- Thêm icon offline vào `components/iconify/icon-sets.ts` (phone, letter, global, mạng xã hội, Zalo).

**Locator mới**: `[data-testid="need-help-link"]`, `help-contact-{phone,email,zalo,website}`, `help-social-{facebook,youtube,telegram,linkedin,github,discord}`, `help-community-<nền-tảng>-<nhóm>`, `help-back-to-sign-in`. Chi tiết: `memory/features/help.md`.

**Mobile cần làm**: chép trang + locale + icon, thêm route, trỏ link ở header auth tới `/help`. Trên app Capacitor, link `tel:`, `mailto:`, `https://zalo.me/…` cần mở bằng app ngoài (kiểm tra `target="_blank"` có bật trình duyệt hệ thống hay không; nếu không thì dùng `@capacitor/browser` / `App.openUrl`). Không cần deploy backend.

| Web (`frontend/src/`) | Mobile (`src/`) | Việc |
|---|---|---|
| `pages/help/page.tsx` | cùng đường dẫn | Chép sang, kiểm layout màn nhỏ (danh sách nhóm đã về 1 cột dưới `sm`) |
| `locales/{en,vi}/help.ts`, `locales/index.ts` | cùng đường dẫn | Chép sang, đăng ký namespace `help` |
| `components/iconify/icon-sets.ts` | cùng đường dẫn | Thêm các icon mới |
| `routes/sections.tsx` | cùng đường dẫn | Thêm route `help` |
| `layouts/auth/layout.tsx` | cùng đường dẫn | Link `href="/help"` + `data-testid="need-help-link"` |
| `app.tsx` | cùng đường dẫn | Thêm `/help` vào `EXTRA_TITLES` |

---

<a id="2026-11-20-10"></a>
## 2026-11-20-10 · Sửa bug Auth + User

Sửa 12 bug `AUTH EXP01–06`, `USER EXP01–06` (xem `docs/bugs/{auth,user}/`), thêm: `DELETE /api/user/{id}` chỉ xoá chính mình, giới hạn tên/email 191 ký tự trên form.

**Thay đổi API — app mobile phải xử lý**

- ⚠️ **Access token đổi payload thành `{ id, sid }`** (`sid` = phiên đăng nhập). Token phát trước khi deploy bị **401**, nên mọi người dùng app phải đăng nhập lại một lần. App phải xử lý 401 bằng cách về màn đăng nhập (không lặp refresh vô hạn).
- Mọi endpoint cần token trả **401** `Token has been revoked. Please login again.` sau khi logout, đổi mật khẩu hoặc email (kể cả đổi trên thiết bị khác).
- `POST /api/login`: sai email hoặc sai mật khẩu → **401** `Invalid email or password.` (trước: 404 / 400 với nội dung khác nhau). Tài khoản khoá → 403, chỉ khi mật khẩu đúng. Cookie `refetchToken` là chuỗi ngẫu nhiên, sống 7 ngày.
- `POST /api/refetch-token`: refresh token đã thu hồi / hết hạn → 404 `Invalid token.` (giữ mã cũ); tài khoản khoá → 403. Refresh cookie cũ không dùng được nữa.
- `DELETE /api/logout`: thu hồi phiên theo `sid` của token, không cần cookie.
- `POST /api/register`, `POST /api/user`: tên rỗng / toàn khoảng trắng / dài hơn 191 ký tự, mật khẩu ngắn hơn 6 ký tự, thiếu email → **422** `{ msg, fields }`. Tên được trim.
- `PATCH /api/profile`: chỉ cập nhật trường được gửi (`password: ""` là giữ mật khẩu cũ). Email trùng → **422** `fields.email`. Thiếu / sai `password_old` → 400. Response 200 thêm `requireLogin: boolean`: `true` khi đổi email hoặc mật khẩu, app phải đăng nhập lại.
- `PATCH /api/user/{id}`, `DELETE /api/user/{id}`: **chỉ với id của chính mình**; id người khác → **403**; không tồn tại → 404. Tự khoá mình (`isActive: false`) → 400. PATCH 200 thêm `requireLogin`.
- `GET /api/user?search=<JSON>`: lọc theo `password`, `refreshTokens`… → 400 với thông báo an toàn.

**Web đã đổi theo**: `api/axios.ts` không thử refresh token khi `/login`, `/register`, `/refetch-token` trả 401; `store/auth.ts` có cờ `checked`, chỉ đẩy về Sign in sau khi `/me` trả lời (mở thẳng URL Setting / Profile không còn bị đá ra); sign-in gọi `/me` (hết `/api/api/me`); danh sách user chỉ bật Sửa / Xoá ở dòng của mình; toast lỗi không văng khi mất mạng.

| Web | Mobile | Việc |
|---|---|---|
| `backend/src/routers/{auth,user}-controller.ts`, `plugins/{auth,filterTable}.ts` | — | Deploy backend |
| `frontend/src/api/{axios,logout}.ts`, `store/auth.ts`, `routes/**` | cùng đường dẫn | Bắt 401 / `requireLogin` → đăng nhập lại; chờ `/me` trước khi chặn route |
| `frontend/src/pages/{sign-in,user-mgt}/**` | cùng đường dẫn | `/me`, chỉ sửa / xoá chính mình, `maxLength` 191, toast mất mạng |

---

<a id="2026-11-20-11"></a>
## 2026-11-20-11 · Sửa bug Book + Promotion

Sửa 10 bug `BOOK EXP01–08`, `PROMOTION EXP01–02` và các bug giao diện phát hiện thêm (form sửa KM xoá nhầm sách, chế độ sửa vẫn tạo mới, menu Edit không chạy, chữ sai, lọc giá, chip mã KM…).

**Quy tắc giá mới**: `currentPrice` = `price` trừ tổng mức giảm của các KM **đang hiệu lực** (đang bật và hôm nay trong khoảng ngày), làm tròn, luôn trong `[0, price]`. Tính lại khi tạo / sửa sách, tạo / sửa / bật / tắt / xoá KM. KM tới hạn hoặc hết hạn thì giá cập nhật ở lần `GET /api/book` kế tiếp (giữ nguyên `updatedAt`). Code: `backend/src/utils/pricing.ts`.

**Thay đổi API**

- `POST /api/book`: trả **201** (trước 200). Chỉ bắt buộc `name`, `categories`. `price` số nguyên 0 – 1.000.000.000. Tên rỗng → 422. Trùng tên → 422 `fields.name`, trùng slug → 422 `fields.slug` (trước 400). Category mới không hợp lệ (rỗng, dài hơn 24 ký tự, có `/`) → 422 `fields.categories`. Slug chuẩn hoá (đ → d). Id KM không tồn tại → 404.
- `PATCH /api/book/{id}`: **chỉ cập nhật trường được gửi** (trước: đặt lại giá, trạng thái, xoá mô tả và ảnh). `categories`, `promotions`, `pictures` gửi lên thì **thay cả danh sách**. Không tồn tại → 404.
- `GET /api/book/{id}`: thêm trường `slug`; sách không ảnh trả `picture: []`.
- `GET /api/book`, `GET /api/promotion-book`: lỗi bộ lọc vẫn 400 `{ msg, error }`, `error` là câu an toàn. Tìm chữ thường trong KM không còn 400. `pagination.lengthData` của KM là số dòng thực trả về (trước là `limit`).
- `POST /api/promotion-book`: chỉ bắt buộc `code`, `name`; mặc định PERCENTAGE, bắt đầu ngay, kết thúc sau 7 ngày, đang bật, không gắn sách. Validate: PERCENTAGE lớn hơn 0 và không quá 100, FIXED_AMOUNT lớn hơn 0, FREE_SHIPPING lưu 0, ngày bắt đầu trước ngày kết thúc → sai là 422 `{ msg, fields }`.
- `PATCH /api/promotion-book/{id}`: chỉ cập nhật trường được gửi; `books` gửi lên thì thay cả danh sách; không tồn tại → 404 `Promotion not found.`; trùng mã → 422.
- Không có endpoint mới, không đổi tên trường.

| Web (`frontend/src/`) | Mobile (`src/`) | Việc |
|---|---|---|
| `backend/src/routers/{book,promotion}-controller.ts`, `utils/pricing.ts` | — | Deploy backend |
| `pages/book-mgt/**` | cùng đường dẫn | Form sửa sách chỉ gửi trường đổi (và chỉ gửi `promotions` khi có đổi); lọc giá; chip mã KM; toast xoá |
| `pages/promotions-mgt/**` (mới: `api/update-promotion.ts`, `api/get-promotion-detail.ts`) | cùng đường dẫn | Sửa KM bằng PATCH, Xoá gọi `deletePromotion`, Edit mở trang sửa |
| `components/fields/from-to-field.tsx`, `components/grid-view/components/table-row-view.tsx` | cùng đường dẫn | Ô giá trống gửi `null`; bỏ tick dòng theo `keyName` |

---

<a id="2026-11-20-12"></a>
## 2026-11-20-12 · Sửa bug File + System + Category

Sửa 8 bug `SYSTEM EXP01`, `FILE EXP01–04`, `CATEGORY EXP01–03`, lỗi `GET /api/file/info` trên Windows và các mục bảo mật còn lại (`/api/db/table`, `/api/status`).

**Thay đổi API**

- `GET /api/file`: `path` là **thư mục** (hoặc có `search`) → **cần Bearer** (thiếu thì 401, khoá thì 403). `path` là **một file** → vẫn công khai, nhưng chỉ trong thư mục upload; ra ngoài → 400 `Invalid path.`. Ảnh bìa và avatar tải qua `<img>` không bị ảnh hưởng.
- File trả về (`/view-file/*`, `GET /api/file?path=<file>`) có thêm `X-Content-Type-Options: nosniff`, CSP `sandbox`. Chỉ jpg, png, gif, webp, bmp là `inline`; loại khác `attachment`; HTML và loại lạ trả `application/octet-stream`.
- `POST /api/file`: chỉ nhận jpg, jpeg, png, gif, webp, bmp, pdf, zip, rar, 7z, gz, tgz, bz2, tar, **kiểm theo nội dung file**; **không nhận SVG nữa**. Sai loại → 422 `fields.files`; path sai → 400; tên sai → 400 `Invalid file name.`; trùng tên → 400. `paths` trả về luôn dùng `/`.
- `PUT /api/file/rename|move|copy`: đổi sang đuôi ngoài danh sách (loại upload được + txt, csv, md, svg) → 400 `File extension not allowed.`; rename mục có tên bắt đầu bằng `$` → 403.
- `DELETE /api/file`: xoá đủ mọi path gửi lên; không xoá được thư mục gốc.
- `GET /api/file/info`: chạy được trên Windows (không còn gọi lệnh `du`).
- Category: tên trim, bắt buộc, tối đa 24 ký tự, cấm `/` → 422 (`fields.name` / `fields.newName`). Trùng → **409** (trước 400). PUT không tìm thấy → 404. DELETE tên có ký tự đặc biệt: app phải `encodeURIComponent`.
- `POST /api/status`: `code` 200–599, `time` 0–30 giây, `msg` tối đa 500 ký tự → sai là 422.
- `GET /api/db/table`: **cần token**.
- Lỗi chung: route không có → 404 `{ msg: "Not found." }`; body hỏng → 400; lỗi chưa bắt → 500 `{ msg: "Internal server error." }` (không còn lộ đường dẫn server).

| Web | Mobile | Việc |
|---|---|---|
| `backend/src/index.ts`, `routers/{file,category,database}-controller.ts`, `utils/upload-security.ts`, `plugins/auth.ts` (`verifyAccessToken`) | — | Deploy backend |
| `frontend/src/components/fields/{upload-field,avatar-field}.tsx` | cùng đường dẫn | Bỏ `.svg` khỏi loại được chọn; ảnh avatar lỗi thì ẩn (không dùng `/$image-404.svg`) |
| `frontend/src/pages/file-mgt/**`, `pages/home/page.tsx` | cùng đường dẫn | Màn File gửi token khi liệt kê; Dashboard bắt buộc chọn Status Code |
| `frontend/src/pages/book-mgt/api/categorys.ts` | cùng đường dẫn | `encodeURIComponent` khi xoá category (mục 01) |

---

<a id="2026-11-20-14"></a>
## 2026-11-20-14 · Swagger: server mặc định theo môi trường

**Web đã làm**

- Trước đây `servers` của Swagger chỉ có `https://book.anhtester.com`. Mở Swagger ở `localhost:4566` rồi bấm *Send* thì trình duyệt gọi sang production, bị CORS chặn → "Failed to fetch".
- `backend/src/regis.ts`: `servers` có cả `http://localhost:<PORT>` và `https://book.anhtester.com`. Chạy `bun run dev` thì localhost lên đầu (mặc định), chạy `bun run start` thì production lên đầu.
- `backend/scripts/export-openapi.ts`: file `docs/api/openapi.json` luôn xếp production lên đầu.

**API**: không đổi endpoint, request hay response. **Locator**: không có.

**Mobile**: không cần làm gì (app gọi thẳng `https://book.anhtester.com`, không dùng Swagger). Deploy backend chỉ để Swagger production có thêm dòng localhost trong ô Server, không bắt buộc.
