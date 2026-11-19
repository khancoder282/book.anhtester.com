# Lộ trình cải thiện app web

Lập ngày 2026-11-20 sau khi rà toàn bộ UI local (Dashboard, Book, User, Promotion, File, Database). Ưu tiên tính năng **sinh ra nhiều tình huống kiểm thử**, vì app dùng để luyện test.

Ký hiệu trạng thái: xem [README.md](README.md).

## Đợt 1: Việc nhỏ (quick wins)

| # | Việc | Trạng thái | Ghi chú |
|---|---|---|---|
| 1.1 | Màn **Category** riêng (`/category-management`): tìm, sắp xếp, tạo, đổi tên, xoá | ✅ 2026-11-20 | Dùng API `/api/category-book` có sẵn. Chi tiết: [mobile-sync.md#2026-11-20-01](mobile-sync.md#2026-11-20-01) |
| 1.2 | Màn **Database** (`/db-management`) hết trống: xem cấu trúc bảng | ✅ 2026-11-20 | API mới `GET /api/db/schema`. Chi tiết: [mobile-sync.md#2026-11-20-02](mobile-sync.md#2026-11-20-02) |
| 1.3 | **Ảnh bìa mặc định** khi sách không có ảnh hoặc ảnh lỗi | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-03](mobile-sync.md#2026-11-20-03) |
| 1.4 | Cột Value của Promotion có đơn vị (`20%`, `50.000 ₫`, `Miễn phí ship`) | ⏳ | |
| 1.5 | Trạng thái Promotion tính theo ngày: Sắp chạy / Đang chạy / Hết hạn | ⏳ | Hiện chỉ dựa vào `isActive` |
| 1.6 | Thống nhất ngôn ngữ UI (vi hoặc en, hoặc nút chuyển vi/en) | ⏳ | Hiện menu tiếng Anh, ngày tháng tiếng Việt |
| 1.7 | Tiêu đề tab không nháy "API RESTful miễn phí…" khi chuyển trang | ⏳ | Tiêu đề mặc định trong `index.html` hiện ra trước khi `<Title>` chạy |

## Đợt 2: Giao diện

| # | Việc | Trạng thái | Ghi chú |
|---|---|---|---|
| 2.1 | Dashboard: thu nhỏ banner, thẻ số liệu bấm được để mở màn tương ứng | ⏳ | |
| 2.2 | Dashboard: biểu đồ (sách xem nhiều, khuyến mãi sắp hết hạn), hoạt động gần đây | ⏳ | Có thể cần API thống kê |
| 2.3 | Màn Book: nút chuyển dạng thẻ / dạng bảng | ⏳ | |
| 2.4 | Màn Book: lọc theo khoảng giá, trạng thái, ngày; giữ bộ lọc trên URL | ⏳ | |
| 2.5 | Thao tác hàng loạt (chọn nhiều dòng để xoá / khoá / bật) ở User, Book, Promotion | ⏳ | Có thể cần API bulk |

## Đợt 3: Tính năng mới

| # | Việc | Trạng thái | Ghi chú |
|---|---|---|---|
| 3.1 | **Đơn hàng**: giỏ hàng, tạo đơn, áp mã KM, tồn kho, trạng thái `PENDING → PAID → SHIPPED` / `CANCELLED` | ⏳ | Đổi schema (Order, OrderItem, tồn kho ở Book) |
| 3.2 | **Phân quyền theo vai trò** (admin / staff / viewer) | ⏳ | Đổi schema User, guard theo role |
| 3.3 | Import / Export CSV cho sách và user | ⏳ | |
| 3.4 | Nhật ký hoạt động (ai sửa gì, lúc nào) | ⏳ | |
| 3.5 | Khu "Practice" cho automation: iframe, kéo thả, shadow DOM, cuộn vô hạn, date picker | ⏳ | |
| 3.6 | Công tắc bật / tắt "bug mẫu" để dùng cho cả bài tìm bug lẫn retest | ⏳ | Cần chốt: 30 bug trong `docs/bugs/` có phải cố ý giữ không |

## Câu hỏi còn mở

- 30 bug đang mở trong [`docs/bugs/README.md`](../docs/bugs/README.md) (9 Critical) có phải **cố ý giữ** để học viên tìm không? Câu trả lời quyết định làm 3.6 hay sửa bug trước.
