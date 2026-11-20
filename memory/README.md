# Bộ nhớ làm việc

Ghi chú tích luỹ trong quá trình làm việc với repo, gồm những điều không đọc thẳng ra được từ code. Đọc file này trước, rồi mở file liên quan.

Cập nhật lần cuối: 2026-11-21, nhánh `deploy-vps`.

## Tính năng (`features/`)

| File | Nội dung |
|---|---|
| [features/auth.md](features/auth.md) | Đăng ký, đăng nhập, JWT, refresh token, profile, logout |
| [features/user.md](features/user.md) | Quản lý user (CRUD, bật/tắt `isActive`) |
| [features/book.md](features/book.md) | Quản lý sách, slug, ảnh, lượt xem, gắn category/promotion |
| [features/category.md](features/category.md) | Category sách (khoá chính là `name`) |
| [features/promotion.md](features/promotion.md) | Mã khuyến mãi gắn với sách |
| [features/file.md](features/file.md) | Upload, duyệt, đổi tên, copy, move, xoá file |
| [features/address.md](features/address.md) | Dữ liệu tỉnh/phường Việt Nam |
| [features/order.md](features/order.md) | Đơn hàng: API báo giá / đặt / xem / huỷ đơn, phí vận chuyển; UI giỏ hàng, thanh toán 4 bước, Đơn hàng của tôi |
| [features/ui-theme.md](features/ui-theme.md) | Giao diện theo AT UI kit: quy ước màu, tone phụ, font, cỡ chữ, PageHeader, sidebar thu gọn, con trỏ / thanh cuộn |
| [features/i18n.md](features/i18n.md) | Đa ngôn ngữ vi/en: `src/locales`, `useTranslate`, nút chuyển, tiêu đề tab |
| [features/help.md](features/help.md) | Trang `/help` (Cần trợ giúp?): thông tin liên hệ Anh Tester, locator |
| [features/system.md](features/system.md) | `/api/status`, `/api/db/table`, Swagger, route tĩnh |

## Lưu ý (`notes/`)

| File | Nội dung |
|---|---|
| [notes/setup-local.md](notes/setup-local.md) | Cách dựng môi trường local, `.env`, database, cổng |
| [notes/build-deploy.md](notes/build-deploy.md) | Build frontend vào backend, những chỗ dễ vướng khi build |
| [notes/security.md](notes/security.md) | Lỗ hổng và điểm yếu đã xác nhận |
| [notes/browser-tooling.md](notes/browser-tooling.md) | Browser pane và Playwright MCP, lỗi profile bị giữ |
| [notes/git-state.md](notes/git-state.md) | Nhánh, stash, các thay đổi chưa commit |
| [notes/main-vs-deploy-vps.md](notes/main-vs-deploy-vps.md) | Khác biệt giữa `main` và `deploy-vps` |
| [notes/seed-data.md](notes/seed-data.md) | Dữ liệu mẫu: lệnh seed, nội dung, cách sinh ảnh |
| [notes/testing-pitfalls.md](notes/testing-pitfalls.md) | Bẫy khi test từ shell Windows (mã hoá tiếng Việt, đổi đường dẫn, `/tmp`) và dữ liệu test |

## Bug report

Danh mục bug ở [`docs/bugs/README.md`](../docs/bugs/README.md), evidence ở `docs/executions/<module>/<nền-tảng>/run_*/evidence/`. Định dạng theo skill `.claude/skills/skills-bug-reporter`.

## Kế hoạch và đồng bộ mobile

Kế hoạch phát triển ở [`plans/roadmap.md`](../plans/roadmap.md). Mỗi thay đổi đã làm trên web ghi ở [`plans/mobile-sync.md`](../plans/mobile-sync.md) để repo `../mobile-book.anhtester.com` chỉnh theo. Repo mobile là app Capacitor dùng gần như cùng mã nguồn React với `frontend/` (cùng đường dẫn `src/pages`, `src/layouts`, `src/routes`), nhưng gọi API production.

## Quy ước khi cập nhật

- Mỗi file chỉ nói về một chủ đề. Thêm tính năng mới thì tạo file mới trong `features/` và thêm một dòng vào bảng trên.
- Ghi ngày tuyệt đối (YYYY-MM-DD), không viết "hôm qua" hay "tuần trước".
- Thông tin đã sai thì sửa hoặc xoá, đừng để tồn tại song song với thông tin mới.
- Quy tắc user đã xác nhận (2026-11-20): ghi ngay vào `CLAUDE.md` **và** bộ nhớ, không để chỉ nằm trong một phiên chat.
- Hướng dẫn cho người dùng repo (cài đặt, chạy, `.env`, seed, tài khoản, build) ghi vào `README.md` ở gốc repo (2026-11-20). `memory/` chỉ giữ ghi chú làm việc.
- Chỉnh tính năng / UI / API (2026-11-20): cùng lúc cập nhật Swagger + `features/<tính-năng>.md`, trạng thái trong `plans/roadmap.md`, và thêm mục vào `plans/mobile-sync.md`.
- Build Swagger (2026-11-20): đổi code API thì `cd backend && bun run swagger:export` (backend đang chạy) để xuất lại `docs/api/openapi.json`, commit cùng code.
