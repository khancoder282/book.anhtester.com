# Danh mục Bug Report — Book Management (book.anhtester.com)

| Mục | Giá trị |
|---|---|
| Hệ thống | Book Management API + UI, môi trường local `http://localhost:4566` (code của production `https://book.anhtester.com`) |
| Quy ước mã bug | `BUG_<module>_<timestamp>_<TC_ID>`. Đợt này là exploratory testing nên hậu tố là `EXPnn` |
| Đường dẫn file | `docs/bugs/<module>/<nền-tảng>/BUG_<module>_<timestamp>_<TC_ID>.md` |
| Ngày cập nhật | 20-11-2026 |

**Tổng quan đợt 20-11-2026** (build `deploy-vps` @ `5fcd241` (code backend từ `64d41c0`, frontend build từ cùng commit)): 30 bug. 🔴 Critical 9 · 🟠 Major 7 · 🟡 Minor 12 · 🟢 Trivial 2. Toàn bộ được tái hiện trên DB local; không gửi request thử nghiệm nào tới production.

**Cập nhật 20-11-2026:** user chốt **sửa hết**. Cả 30 bug đã sửa trên `deploy-vps` và được người sửa chạy lại đúng bước tái hiện trên local (xem dòng ✅ FIXED trong bảng *Lịch sử retest* của từng file). Chưa có đợt retest độc lập bằng `/retest-fixed-bugs`; production chỉ có bản sửa sau khi deploy. Thay đổi API kèm theo: [`plans/mobile-sync.md`](../../plans/mobile-sync.md) mục 2026-11-20-10 → 12.

## 1. Danh mục bug

| Mã bug | Module | Nền tảng | Tiêu đề ngắn | Severity | Priority | Trạng thái | TC liên quan | Ngày phát hiện |
|---|---|---|---|---|---|---|---|---|
| [BUG_auth_1795111365_EXP01](auth/api/BUG_auth_1795111365_EXP01.md) | `AUTH` | `api` | Refresh token đã revoke vẫn cấp được access token | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP01` | 20-11-2026 |
| [BUG_user_1795111371_EXP01](user/api/BUG_user_1795111371_EXP01.md) | `USER` | `api` | Email bị ghi đè thành user@example.com khi sửa profile/user | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP01` | 20-11-2026 |
| [BUG_user_1795111372_EXP02](user/api/BUG_user_1795111372_EXP02.md) | `USER` | `api` | search JSON công khai lộ hash mật khẩu và refresh token, chiếm được tài khoản | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP02` | 20-11-2026 |
| [BUG_system_1795111377_EXP01](system/api/BUG_system_1795111377_EXP01.md) | `SYSTEM` | `api` | /view-file path traversal đọc .env, mã nguồn, .git | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP01` | 20-11-2026 |
| [BUG_file_1795111378_EXP01](file/api/BUG_file_1795111378_EXP01.md) | `FILE` | `api` | Upload / rename ghi file ra ngoài thư mục upload | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP01` | 20-11-2026 |
| [BUG_file_1795111379_EXP02](file/web/BUG_file_1795111379_EXP02.md) | `FILE` | `web` | Upload HTML/SVG giả ảnh dẫn tới stored XSS đọc accessToken | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP02` | 20-11-2026 |
| [BUG_book_1795111382_EXP01](book/api/BUG_book_1795111382_EXP01.md) | `BOOK` | `api` | PATCH sách đặt lại giá/trạng thái, xoá mô tả và ảnh | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP01` | 20-11-2026 |
| [BUG_book_1795111383_EXP02](book/api/BUG_book_1795111383_EXP02.md) | `BOOK` | `api` | Không gửi promotions → áp mọi KM đang chạy vào currentPrice | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP02` | 20-11-2026 |
| [BUG_promotion_1795111390_EXP01](promotion/api/BUG_promotion_1795111390_EXP01.md) | `PROMOTION` | `api` | KM không validate → giá bán âm / tăng | 🔴 Critical | P1 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP01` | 20-11-2026 |
| [BUG_auth_1795111366_EXP02](auth/api/BUG_auth_1795111366_EXP02.md) | `AUTH` | `api` | Access token còn hiệu lực sau logout / đổi mật khẩu | 🟠 Major | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP02` | 20-11-2026 |
| [BUG_auth_1795111368_EXP04](auth/api/BUG_auth_1795111368_EXP04.md) | `AUTH` | `api` | Thông báo lỗi bị thay bằng 422 "Property 'fields' is missing" | 🟠 Major | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP04` | 20-11-2026 |
| [BUG_user_1795111373_EXP03](user/api/BUG_user_1795111373_EXP03.md) | `USER` | `api` | Thiếu phân quyền: user khoá / đổi mật khẩu user khác | 🟠 Major | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP03` | 20-11-2026 |
| [BUG_book_1795111384_EXP03](book/api/BUG_book_1795111384_EXP03.md) | `BOOK` | `api` | PATCH price không cập nhật currentPrice | 🟠 Major | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP03` | 20-11-2026 |
| [BUG_book_1795111385_EXP04](book/api/BUG_book_1795111385_EXP04.md) | `BOOK` | `api` | PATCH categories/promotions chỉ thêm, không thay thế | 🟠 Major | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP04` | 20-11-2026 |
| [BUG_book_1795111386_EXP05](book/api/BUG_book_1795111386_EXP05.md) | `BOOK` | `api` | Validation giá sách: âm / thập phân / tràn số | 🟠 Major | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP05` | 20-11-2026 |
| [BUG_promotion_1795111391_EXP02](promotion/api/BUG_promotion_1795111391_EXP02.md) | `PROMOTION` | `api` | Tắt KM không tính lại currentPrice | 🟠 Major | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP02` | 20-11-2026 |
| [BUG_auth_1795111367_EXP03](auth/api/BUG_auth_1795111367_EXP03.md) | `AUTH` | `api` | Cookie refetchToken Max-Age ≈ 57 năm | 🟡 Minor | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP03` | 20-11-2026 |
| [BUG_user_1795111375_EXP05](user/web/BUG_user_1795111375_EXP05.md) | `USER` | `web` | Mở thẳng URL Setting/Profile bị đẩy về Sign in | 🟡 Minor | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP05` | 20-11-2026 |
| [BUG_file_1795111380_EXP03](file/api/BUG_file_1795111380_EXP03.md) | `FILE` | `api` | Upload path lạ → 500 lộ đường dẫn server | 🟡 Minor | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP03` | 20-11-2026 |
| [BUG_book_1795111387_EXP06](book/api/BUG_book_1795111387_EXP06.md) | `BOOK` | `api` | Slug: mất chữ đ, báo lỗi nhầm, slug rỗng | 🟡 Minor | P2 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP06` | 20-11-2026 |
| [BUG_auth_1795111369_EXP05](auth/api/BUG_auth_1795111369_EXP05.md) | `AUTH` | `api` | Tên rỗng / khoảng trắng và mật khẩu 1 ký tự được chấp nhận | 🟡 Minor | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP05` | 20-11-2026 |
| [BUG_auth_1795111370_EXP06](auth/api/BUG_auth_1795111370_EXP06.md) | `AUTH` | `api` | Login lộ email tồn tại / trạng thái khoá | 🟡 Minor | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP06` | 20-11-2026 |
| [BUG_user_1795111374_EXP04](user/api/BUG_user_1795111374_EXP04.md) | `USER` | `api` | User tự khoá được chính mình | 🟡 Minor | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP04` | 20-11-2026 |
| [BUG_file_1795111381_EXP04](file/api/BUG_file_1795111381_EXP04.md) | `FILE` | `api` | GET /api/file không cần token | 🟡 Minor | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP04` | 20-11-2026 |
| [BUG_book_1795111388_EXP07](book/api/BUG_book_1795111388_EXP07.md) | `BOOK` | `api` | Sách không ảnh trả picture giả | 🟡 Minor | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP07` | 20-11-2026 |
| [BUG_category_1795111392_EXP01](category/api/BUG_category_1795111392_EXP01.md) | `CATEGORY` | `api` | Category tên rỗng / báo nhầm "already exists" | 🟡 Minor | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP01` | 20-11-2026 |
| [BUG_category_1795111393_EXP02](category/api/BUG_category_1795111393_EXP02.md) | `CATEGORY` | `api` | Category chứa '/' không xoá được | 🟡 Minor | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP02` | 20-11-2026 |
| [BUG_category_1795111394_EXP03](category/api/BUG_category_1795111394_EXP03.md) | `CATEGORY` | `api` | PUT category: thông báo lỗi chung chung | 🟡 Minor | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP03` | 20-11-2026 |
| [BUG_user_1795111376_EXP06](user/web/BUG_user_1795111376_EXP06.md) | `USER` | `web` | Frontend gọi /api/api/me (thừa /api) | 🟢 Trivial | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP06` | 20-11-2026 |
| [BUG_book_1795111389_EXP08](book/api/BUG_book_1795111389_EXP08.md) | `BOOK` | `api` | POST /api/book trả 200 thay vì 201 | 🟢 Trivial | P3 | ✅ **Đã sửa** (20-11-2026, chưa retest độc lập) | `EXP08` | 20-11-2026 |
