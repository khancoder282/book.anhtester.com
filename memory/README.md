# Bộ nhớ làm việc

Ghi chú tích luỹ trong quá trình làm việc với repo, gồm những điều không đọc thẳng ra được từ code. Đọc file này trước, rồi mở file liên quan.

Cập nhật lần cuối: 2026-11-20, nhánh `deploy-vps`.

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
| [notes/testing-pitfalls.md](notes/testing-pitfalls.md) | Bẫy khi test từ shell Windows (mã hoá tiếng Việt, đổi đường dẫn, `/tmp`) và dữ liệu test |

## Bug report

Danh mục bug ở [`docs/bugs/README.md`](../docs/bugs/README.md), evidence ở `docs/executions/<module>/<nền-tảng>/run_*/evidence/`. Định dạng theo skill `.claude/skills/skills-bug-reporter`.

## Quy ước khi cập nhật

- Mỗi file chỉ nói về một chủ đề. Thêm tính năng mới thì tạo file mới trong `features/` và thêm một dòng vào bảng trên.
- Ghi ngày tuyệt đối (YYYY-MM-DD), không viết "hôm qua" hay "tuần trước".
- Thông tin đã sai thì sửa hoặc xoá, đừng để tồn tại song song với thông tin mới.
