# Giao diện theo AT UI kit (2026-11-21)

User chốt 2026-11-21: UI web theo tone màu **AT UI kit** của repo LMS (`C:\wamp64\www\anhtester_lms`, file `public/build/css/at-ui.css`, mẫu ở `/ui-kit` của LMS). Không sửa repo LMS, chỉ lấy tone.

## Quy ước màu

| Vai trò | Màu | Trong MUI |
|---|---|---|
| Hành động chính (1 nút / màn: tạo mới, lưu, đăng nhập, mua ngay, đặt hàng) | cam `#FB8A2E → #E06004` | `color="secondary"` |
| Phụ / đang chọn / liên kết | xanh lá logo `#42BC40 → #268A24` | `primary` |
| Thông tin / xem trước (đọc thử, xem ảnh) | xanh dương `#3B8FE8 → #1570CD` | `info` |
| Xoá / huỷ | đỏ `#F0605D → #C9302C` | `error` |
| Trung tính tối | slate | `color="inherit"` + `contained` |

Tone phụ (user yêu cầu thêm "xanh dương nhạt…"): `sky`, `indigo`, `cyan`, `purple`, `pink`, `teal`, `mint`, `amber` — cho nhãn thể loại, bìa mặc định, ô icon tiêu đề. Không thay quy ước trên.

## Code

- `frontend/src/theme/at-tones.ts`: bảng tone + CSS variable toàn cục (`--at-<tone>-1/2`, `--at-grad-<tone>`, `--at-glow-<tone>`, `--at-<tone>-bg/ink`, `--at-line`, `--at-sunken`, `--at-shadow`, `--at-paper`), có giá trị dark mode theo `[data-color-scheme="dark"]`. Hàm `atGrad/atGlow/atBg/atInk/toneOf(name)` (cùng tên → cùng tone).
- `theme-config.ts` (palette), `core/components.tsx` (nút gradient lấy theo palette light → main nên màu user chọn ở Cài đặt vẫn khớp; card bo 16 viền `--at-line`; input bo 11 + vòng focus; đầu bảng in hoa nhỏ), `core/typography.ts`.
- ⚠️ `app.tsx` đè primary bằng màu user chọn (`useThemeData`, mặc định `#42BC40`). Mặc định thì dùng `themeConfig.palette.primary` (AT), màu khác thì `generateColorPalette`.
- Font: Inter (giao diện) + Merriweather (tên sách, tiêu đề lớn, trình đọc) qua `@fontsource-variable/*` trong `global.css`. DM Sans / Barlow cũ **không có dấu tiếng Việt** nên đã bỏ khỏi `global.css` (gói npm vẫn còn trong `package.json`).
- Cỡ chữ (user 2026-11-21: "text size tăng cho tất cả các trang"): body1 17, body2 15.5, caption 13.5, button 15, subtitle 17/15.5, h4 22→26, h5 19→21, h6 18→19.
- `PageHeader` (`components/page-header/page-header.tsx`): ô icon gradient theo tone + tiêu đề + mô tả + nút. Dùng ở User, Category, Promotion, form sách, form KM, Hồ sơ, Cài đặt, Đơn hàng.
- Sidebar thu gọn: `store/nav-collapse.ts` (zustand persist, khoá `book-anhtester:nav-collapsed`), `layouts/dashboard/nav.tsx` (mini 88px, tooltip), `css-vars.ts` đổi `--layout-nav-vertical-width`. Chỉ theo trình duyệt (user yêu cầu).
- Thanh cuộn gradient + con trỏ chuột + `::selection`: cuối `global.css`; SVG con trỏ ở `public/assets/cursors/`.

## Lưu ý

- Icon Iconify phải đăng ký offline trong `components/iconify/icon-sets.ts` (type `IconifyName` chặt, tên lạ là lỗi TS). Lấy body từ `https://api.iconify.design/<prefix>.json?icons=a,b`. ⚠️ Solar đổi tên `magnifer-*` → `magnifier-*` (tên cũ chỉ còn là alias, API trả về dưới tên mới).
- Ghi file bằng Python heredoc trong Git Bash trên máy này dễ hỏng: dấu nháy đơn trong nội dung làm vỡ heredoc, và có lần `\r\n` trong chuỗi bị biến thành xuống dòng thật. Đoạn có `\` hoặc nháy thì viết bằng Edit/Write.
- Vite dev server có lúc đọc file đúng lúc đang bị ghi đè → cache module rỗng, trang lazy báo "Cannot convert object to primitive value". `touch` lại file là hết.
- Ô tìm kiếm phải dùng `searchInputProps` (`components/fields/search-input-props.ts`: `type="search"`, `autocomplete="off"`, data-* cho LastPass / 1Password). Lý do: theme đặt mặc định `autoComplete: 'new-password'` cho mọi InputBase, và Chrome từng tự điền email đã lưu vào ô tìm trang User khi vừa mở trang (2026-11-21). Nút × mặc định của ô search ẩn trong `global.css`.
