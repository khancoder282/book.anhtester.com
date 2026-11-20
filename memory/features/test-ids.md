# Locator cho tester: `data-testid` và `id`

Thêm 2026-11-21. Mục đích: tester lấy element bằng hàm có sẵn, không phải viết CSS/XPath.

- **Playwright** (TS / Java / Python / .NET): `page.getByTestId('login-email')` đọc `data-testid` mặc định, không cần cấu hình. Đổi thuộc tính khác thì `use: { testIdAttribute }` trong `playwright.config.ts`, app giữ `data-testid`.
- **Selenium**: không có hàm riêng, dùng `By.cssSelector("[data-testid='login-submit']")`. Trang Login / Register có thêm `id` trùng tên nên `By.id(...)` dùng được.

## Quy ước

- Tên kebab-case `<khu>-<phần-tử>`. Phần tử lặp theo dòng thêm hậu tố dữ liệu ổn định: id (`user-row-edit-<id>`), slug (`book-card-small-<slug>`), tên category (`category-row-<name>`, vì khoá chính của Category là `name`, có thể có dấu và khoảng trắng). Không dùng chỉ số mảng, trừ dòng bộ lọc (`-filter-field-<n>`) không có khoá nào khác.
- Ô nhập MUI: `data-testid` nằm trên **chính thẻ `<input>` / `<textarea>`** (`.fill()` được ngay) qua `textFieldTestId(id)` ở `frontend/src/utils/test-id.ts`. Dòng lỗi / gợi ý dưới ô: `<id>-error`. MUI cũng tự đặt `id="<id>-helper-text"` khi ô có `id`.
- `PasswordField`: prop `testId` (mặc định lấy `id`), nút ẩn / hiện mật khẩu `<testId>-toggle` (có `aria-label` dịch theo ngôn ngữ, khoá `components.password.show|hide`).
- Select: `data-testid` trên ô bấm được (`SelectDisplayProps`), không trên `<input>` ẩn (Playwright không bấm được vì `pointer-events: none`). Date picker: trên khung, `<input>` ẩn là `<testId>-input`.
- **Chỉ thêm, không đổi / xoá `id` hay `data-testid` đã có** (test cũ và repo mobile đang dùng, VD `#btn-language`, `#menu-language`, `#search-category`, `#table-category`, `#address-division`, `#address-ward`, `#address`).

## Component dùng chung nhận prop tiền tố

| Component | Prop (mặc định) | Sinh ra |
|---|---|---|
| `TableView`, `TableFilterView`, `TablePaginationView` (grid-view) | `testId` (`table`) | `<p>`, `<p>-select-all`, `<p>-sort-<col>`, `<p>-header-filter-<col>`, `<p>-row-<key>`, `<p>-row-select-<key>`, `<p>-row-menu-<key>`, `<p>-no-data`, `<p>-search`, `<p>-filter-toggle|add|clear`, `<p>-filter-{remove,mode,field,operator,value}-<n>`, `<p>-pagination`, `-rows-per-page`, `-first|previous|next|last`, `-page-<n>` |
| `DialogConfirmForm` (`dialog.form`) | `testId` (`form-dialog`) | `<t>-title`, `<t>-<key>`, `<t>-save`, `<t>-cancel` |
| `SearchField` | `testId` (`search`) | `<t>`, `<t>-clear` |
| `UploadField` | `testId` (`upload`) | `<t>-input`, `-dropzone`, `-error`, `-view-grid`, `-view-list` |
| `AvatarField` | `testId` (`avatar`) | `<t>-input`, `-dropzone`, `-preview` |
| `AddressField` | `id` (`address`) | `<id>-division`, `<id>-ward`, `<id>-detail`, `<id>-error` (giữ nguyên `id` cũ của 3 ô) |
| `DatePickerField`, `BookCover`, `NoData` | `testId` | `<t>`, `<t>-input`, `<t>-error` |
| `ContentUser` (form user) | `testIdPrefix` (`user`) | `<p>-name`, `-phone`, `-address-*`, `-email`, `-old-password`, `-password`, `-password-confirmation` (+ `-toggle`, `-error`), `-active`, `-avatar-*`. Register dùng `register`, profile `profile`, dialog thêm / sửa user `user`. Ô nhập có cả `id` trùng tên |

Dialog chung: `confirm-dialog` (+ `-title`, `-message`, `-ok`, `-cancel`), `delete-dialog-title|message|confirm|cancel`, `message-dialog-title|message|close`.

## Theo màn

| Màn | testid chính |
|---|---|
| Login | `login-title`, `login-sign-up-link`, `login-form`, `login-email`, `login-password` (+ `-toggle`), `login-email-error`, `login-password-error`, `login-submit` — **có cả `id` cùng tên** |
| Register | `register-title`, `register-sign-in-link`, `register-name`, `register-phone`, `register-address-division|ward|detail`, `register-email`, `register-password`, `register-password-confirmation` (+ `-toggle`, `-error`), `register-submit` — **có cả `id`** (trừ 3 ô địa chỉ giữ `id` cũ) |
| Header / sidebar | `nav-item-<home|user-management|book-management|category-management|promotion-book-management|contact>`, `nav-mobile-open`, `nav-toggle`, `language-button`, `language-menu`, `language-option-<en|vi>`, `account-button`, `account-menu`, `account-name`, `account-email`, `account-menu-<home|profile|order|settings>`, `account-logout` (có `id="account-button"`, `id="account-logout"`) |
| Dashboard | `home-stat-<user|book|category|promotion>` (+ `-icon-link`, `-link`, `-total`), `home-swagger-link`, `home-welcome-link`, `home-timeout`, `home-timeout-input`, `home-status-code` (+ `-error`), `home-status-option-<code>`, `home-submit` |
| User | `user-add`, bảng tiền tố `user`, `user-row-{name,you,email,phone,address,status,edit,delete}-<id>`, `user-dialog-title|cancel|save` |
| Profile / Setting | `profile-*` (form), `profile-breadcrumb-users`, `profile-reset`, `profile-save`; `setting-breadcrumb-users`, `setting-theme-tabs`, `setting-theme-<light|dark|system>`, `setting-color-<palette>-<shade>`, `setting-reset`, `setting-save` |
| Category | `category-add`, `-search`, `-summary`, `-table`, `-sort-<name|isActive|bookCount>`, `-row-<name>`, `-row-{name,status,status-label,books,rename,delete}-<name>`, `-no-data`, `category-dialog-title|name|save|cancel` |
| Book (danh sách) | `book-filter-toggle`, `book-filter-search` (+ `-clear`), `book-filter-price-label`, `book-category-tabs`, `book-category-tab-all`, `book-category-tab-<name>`, `book-category-tab-count-<name>`, `book-category-settings`, `book-category-dialog*`, `book-category-item-*-<name>`, `book-sort`, `-value`, `-menu`, `-option-<feature|newest|price-low-to-high|price-high-to-low>` (có sẵn từ trước: `book-hero-*`, `book-card-*`, `book-gallery-*`) |
| Book (form) | `book-form-breadcrumb-list`, `-available`, `-reset`, `-submit`, `-delete`; `book-detail-toggle`, `book-name`, `book-slug` (+ `-toggle`), `book-description`, `book-picture-*`, `book-picture-remove-all`; `book-property-toggle`, `book-price`, `book-categories` (+ `-option-<name>`, `-chip-<name>`); `book-more-info-toggle`, `book-author`, `book-publisher`, `book-language`, `book-publish-year`, `book-page-count`, `book-isbn`; `book-promotion-row-{code,name,type,value}-<id>` |
| Promotion | `promotion-add`, bảng tiền tố `promotion`, `promotion-row-{edit,delete,code,name,type,status,value}-<id>`; form: `promotion-breadcrumb-list`, `-active`, `-reset`, `-submit`, `-delete`, `-name`, `-code`, `-description`, `-value`, `-type`, `-type-option-<TYPE>`, `-detail-toggle`, `-start-date`, `-end-date`, `-status-toggle`, bảng sách tiền tố `promotion-book`, `promotion-books-toggle`, `selected-book-<id>`, `selected-books-remove-all` |
| 404 | `not-found-title`, `not-found-description`, `not-found-home` |
| Shop / giỏ / đơn | Có từ trước (`cart-*`, `checkout-*`, `order-*`, `summary-*`) |

Chưa gắn: `from-to-field.tsx`, màn File và Database (đang ẩn).
