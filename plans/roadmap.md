# Lộ trình cải thiện app web

Lập ngày 2026-11-20 sau khi rà toàn bộ UI local (Dashboard, Book, User, Promotion, File, Database). Ưu tiên tính năng **sinh ra nhiều tình huống kiểm thử**, vì app dùng để luyện test.

Ký hiệu trạng thái: xem [README.md](README.md).

## Đợt 1: Việc nhỏ (quick wins)

| # | Việc | Trạng thái | Ghi chú |
|---|---|---|---|
| 1.1 | Màn **Category** riêng (`/category-management`): tìm, sắp xếp, tạo, đổi tên, xoá | ✅ 2026-11-20 | Dùng API `/api/category-book` có sẵn. Chi tiết: [mobile-sync.md#2026-11-20-01](mobile-sync.md#2026-11-20-01) |
| 1.2 | Màn **Database** (`/db-management`) hết trống: xem cấu trúc bảng | ✅ 2026-11-20 | API mới `GET /api/db/schema`. Chi tiết: [mobile-sync.md#2026-11-20-02](mobile-sync.md#2026-11-20-02) |
| 1.3 | **Ảnh bìa mặc định** khi sách không có ảnh hoặc ảnh lỗi | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-03](mobile-sync.md#2026-11-20-03) |
| 1.4 | Cột Value của Promotion có đơn vị (`20%`, `50.000 ₫`, `Miễn phí ship`) | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-05](mobile-sync.md#2026-11-20-05) |
| 1.5 | Trạng thái Promotion tính theo ngày: Sắp chạy / Đang chạy / Hết hạn | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-05](mobile-sync.md#2026-11-20-05) |
| 1.6 | Nút chuyển ngôn ngữ **vi / en** cho toàn bộ UI | ✅ 2026-11-20 | Chốt 2026-11-20: có nút chuyển, mặc định `en`. Chi tiết: [mobile-sync.md#2026-11-20-06](mobile-sync.md#2026-11-20-06) |
| 1.7 | Tiêu đề tab đổi ngay khi chuyển trang | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-07](mobile-sync.md#2026-11-20-07) |
| 1.9 | **Ẩn màn File và Database** khỏi menu và route (URL ra 404), giữ code và API | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-08](mobile-sync.md#2026-11-20-08) |
| 1.10 | Trang **Cần trợ giúp?** (`/help`): thông tin liên hệ Anh Tester, mở từ link ở header trang đăng nhập / đăng ký | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-09](mobile-sync.md#2026-11-20-09) |
| 1.12 | Swagger: ô **Server** mặc định theo môi trường (dev → `localhost:4566`, production → `book.anhtester.com`), hết lỗi "Failed to fetch" khi Send từ Swagger local | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-14](mobile-sync.md#2026-11-20-14) |
| 1.8 | Dữ liệu **Address** đúng đơn vị hành chính hiện hành (34 tỉnh/thành, 3.321 phường/xã/đặc khu), API trả theo thứ tự mã hành chính | ✅ 2026-11-20 | Chi tiết: [mobile-sync.md#2026-11-20-04](mobile-sync.md#2026-11-20-04) |

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
| 3.6 | Công tắc bật / tắt "bug mẫu" để dùng cho cả bài tìm bug lẫn retest | ⛔ Bỏ 2026-11-20 | User chốt sửa hết bug, không giữ bug mẫu |

## Câu hỏi còn mở

- ~~30 bug trong `docs/bugs/` có phải cố ý giữ không?~~ **Đã chốt 2026-11-20: sửa hết** (cả 30 bug và các bug phát hiện thêm bên dưới). Việc 3.6 vì vậy không cần nữa.
- ~~Màn File trên Windows trống vì `GET /api/file/info` gọi lệnh `du`~~ **Đã sửa 2026-11-20**: tính dung lượng bằng code Bun.
- App không có role: sau khi sửa bug phân quyền, mỗi user chỉ sửa / khoá / xoá **chính mình**. Muốn admin quản lý người khác thì làm việc 3.2 (phân quyền theo vai trò).

## Bug phát hiện thêm khi làm đa ngôn ngữ (2026-11-20, chưa vào `docs/bugs/`) — ✅ đã sửa hết 2026-11-20

Đọc code trong lúc dịch thì thấy, không viết bug report riêng. **Đã sửa hết 2026-11-20** cùng đợt sửa 30 bug (chữ tiếng Anh sai cũng đã sửa ở cả en và vi). Chi tiết thay đổi: [mobile-sync.md](mobile-sync.md) mục 10–12. Đã kiểm trên trình duyệt: sửa / xoá khuyến mãi (PATCH, xoá đúng khuyến mãi, sách còn nguyên), chip mã khuyến mãi.

| Module | Bug | File |
|---|---|---|
| Promotion | Form sửa khuyến mãi: nút Delete gọi `deleteBook(id)` (xoá **sách** theo id khuyến mãi) rồi về `/book-management` | `pages/promotions-mgt/handle.tsx` |
| Promotion | Chế độ sửa vẫn gọi `createPromotion` (POST), không có API cập nhật | `handle.tsx` |
| Promotion | Menu *Edit* trong danh sách có `onClick={() => {}}`, bấm không làm gì | `components/action-list.tsx` |
| Promotion | Hộp xác nhận xoá ghi "delete user"; nút tạo ghi "Create book"; ô mã ghi "Code book"; breadcrumb luôn "Create a new promotion" | `action-list.tsx`, `handle.tsx`, `card-detail.tsx` |
| Book | Chip khuyến mãi đã chọn hiện chữ `[item.code]` thay vì mã | `book-mgt/components/card-promotion.tsx` |
| Book | Lọc giá có cả "từ" và "đến" thì chỉ áp "đến" (điều kiện sau ghi đè điều kiện trước) | `book-mgt/stores/filter.ts` |
| Book | Hộp quản lý category trong bộ lọc: tìm kiếm thì hiện sai category (số dòng theo danh sách đã lọc, nội dung theo danh sách đầy đủ) | `book-mgt/components/filter-book.tsx` |
| Book | Xoá sách thành công lại hiện toast kiểu lỗi | `book-mgt/api/delete-book.ts` |
| Book | Nhãn công tắc trạng thái luôn "Available book"; breadcrumb luôn "Create a new book"; giá tối đa 100 tỷ nhưng thông báo ghi "1 billion"; ô slug dùng thông báo lỗi của ô tên | `add-overview.tsx`, `card-property.tsx`, `card-detail.tsx` |
| File | Hộp xoá thư mục ghi "...folder: "X" this file?"; thông báo đường dẫn upload ghi "not starting with /" nhưng regex cho phép `/` đầu; breadcrumb ghép đường dẫn thiếu `/` đầu; sắp xếp danh sách làm đổi mảng gốc | `file-mgt/components/*` |
| User | `toast.error(err.response.data.msg)` văng lỗi khi mất mạng (`err.response` là `undefined`) | `user-mgt/api/*`, `sign-in/api/login.ts`, `setting.tsx` |
| Chung | Xoá trống ô giá trong bộ lọc gửi `0` thay vì bỏ điều kiện; Dashboard để trống *Status Code* rồi Gửi thì gửi `code: 0` | `components/fields/from-to-field.tsx`, `pages/home/page.tsx` |
