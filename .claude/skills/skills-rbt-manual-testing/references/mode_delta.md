# Mode 4: DELTA — Cập Nhật Bộ TC Đã Có

## Mục đích

Đồng bộ bộ TC **đã tồn tại** với requirements vừa đổi theo ticket. Chỉ chạm phần bị ảnh hưởng, giữ nguyên mọi thứ còn lại.

Workflow: `/update-testcases-from-impact` — quy trình 7 bước chi tiết nằm trong workflow đó (Quality Gate chạy ở bước cuối, sau khi đã ghi Nhật ký và Delta TC List). Mục này là **bộ quy tắc bất biến** mà mọi lần chạy DELTA phải tuân thủ.

## Nguyên tắc gốc: TC ID là khoá, không phải nhãn

TC ID xuất hiện ở **ba nơi ngoài file TC**: `allure.label('testId', ...)` trong script automation · cột TC ID của RTM · execution report của các lần chạy trước. Đổi hoặc đánh lại TC ID là cắt cả ba mối nối cùng lúc, và không có cách nào phát hiện tự động — chỉ thấy coverage tự nhiên tụt mà không rõ vì sao.

Vì vậy Mode DELTA đặt việc **bảo toàn TC ID** lên trên mọi mục tiêu khác, kể cả trên sự gọn gàng của tài liệu.

## 5 Quy tắc bắt buộc

| # | Quy tắc | Vì sao |
|---|---|---|
| 1 | **Sửa tại chỗ** trong file nền tảng `<nền-tảng>/test_cases_<module>_<nền-tảng>.md` / `<nền-tảng>/parts/part_NN_*.md` — tên file không đổi | Mọi workflow sau (`/execute-test-cases`, `/update-automation-from-impact`, `/generate-traceability-matrix`) đọc theo mẫu đường dẫn cố định |
| 2 | **Ghi mốc git trước khi sửa** — hash commit gần nhất của file (`git log -1 --format=%h -- <file>`). File đang có thay đổi chưa commit (`git status --short <file>` có dòng) → **dừng**, đề nghị user commit trước; agent không tự commit | Sửa tại chỗ không có bản đối chiếu thì không ai kiểm được agent đã đổi gì. Có mốc thì xem lại bản cũ bằng `git show <hash>:<file>`, so bằng `git diff <hash> -- <file>` |
| 3 | **Giữ nguyên TC ID.** TC mới cấp số tiếp dải hiện có, KHÔNG chèn vào giữa | Xem nguyên tắc gốc ở trên |
| 4 | **KHÔNG xoá dòng TC.** Chức năng gỡ → gắn tag `@Deprecated` ở cột `Tags` **và** tiền tố `🗑️ Deprecated (TICKET-XXX, <DD-MM-YYYY>) —` ở đầu ô `Test Scenario` (quy ước ở phần giải thích cột Tags) | Đối xứng quy tắc "KHÔNG xoá dòng REQ". Xoá dòng là mất dấu vết TC từng tồn tại, và script tương ứng thành orphan |
| 5 | **Đọc REQ đã đổi, không suy từ tên TC** | Tên TC không chứa kỳ vọng. Sửa theo suy đoán tạo ra TC nghe hợp lý nhưng sai kỳ vọng mới — loại lỗi khó phát hiện nhất |

## Bảng ánh xạ: REQ đổi gì → TC sửa gì

| Delta của REQ | Vòng · Nhánh | Hành động với TC |
|---|---|---|
| Đổi **nhãn nguyên văn** (nút, tiêu đề, nhãn field, thông báo) | **V1 · UI cơ bản** | Sửa nhãn trong bảng kiểm màn hình **và** mọi Expected Result trích nhãn đó |
| **Thêm / bớt field** trên form | **V1 · UI cơ bản** (+ V2 kèm theo) | Thêm/bớt **dòng bảng kiểm** thành phần màn hình, kiểm lại thứ tự field — **rồi mới** tới TC Required/Validation ở V2 |
| Đổi **giá trị mặc định** (checkbox tick sẵn, option đang chọn) | **V1 · UI cơ bản** | Sửa dòng tương ứng trong bảng kiểm |
| Đổi **định dạng hiển thị** (tiền, ngày, badge) | **V1 · Display** | Sửa Expected Result ghi đúng định dạng mới |
| Đổi **hành vi giao diện** (nút khoá đến khi đủ điều kiện, field bật/tắt) | **V2 · UI Behavior** | Sửa TC hành vi, kiểm **cả hai chiều** bật/tắt điều kiện |
| Đổi expected result / message | V2 · theo nhánh của TC | Sửa cột Expected Result, ghi message **nguyên văn** từ UI |
| Field tuỳ chọn → **bắt buộc** | **V2 · Required** | Sửa TC happy path + **thêm TC negative** để trống field |
| Đổi luật validation (độ dài, định dạng, dải) | **V2 · Validation + BVA** | Sửa lại **cả 3 mốc** boundary: dưới / đúng / trên ngưỡng |
| Đổi steps / luồng | **V2 · Use Case** | Sửa Steps + kiểm Precondition còn đúng không |
| Đổi quy tắc nghiệp vụ / trạng thái | **V2 · Business Rule · State Transition** | Sửa bảng quyết định / bảng transition, cả ô hợp lệ lẫn ô bị chặn |
| Đổi phân quyền | **V3 · Permission** | Sửa TC phân quyền + kiểm ma trận role |
| Đổi breakpoint / trình duyệt cam kết | **V4 · Responsive · Compatibility** | Sửa danh sách kích thước/trình duyệt trong TC |
| REQ 🔴 bị gỡ | Nhánh của TC đó | TC → tag `@Deprecated` + tiền tố `🗑️ Deprecated (TICKET-XXX, <ngày>) —` ở `Test Scenario`, giữ dòng |
| REQ 🟢 mới | — | ❌ Ngoài phạm vi DELTA → QUICK / FULL RBT |

> 🚨 **Bốn dòng V1 đầu bảng bắt buộc mở evidence trước khi sửa** — đúng **4 nhóm TC không được suy diễn** của [Quy Tắc Đối Chiếu Evidence](#quy-tắc-đối-chiếu-evidence-bắt-buộc--áp-dụng-cả-4-modes-chạy-trước-batch-đầu-tiên). Chưa có ảnh mới của màn hình sau khi đổi thì **không sửa**, gắn `@NeedsVerify` và báo user recon bổ sung.
>
> 🚨 **Độ hạt GỘP:** thêm field = thêm **một dòng vào Bảng kiểm** của TC `UI cơ bản` (Kiểu B), KHÔNG tạo TC mới, KHÔNG tách dòng đó ra. Trần 6 biến thể/TC vẫn áp dụng.

## Tác động lan toả — 5 câu phải tự hỏi

Đây là phần Mode DELTA dễ làm hụt nhất, vì Impact Report chỉ liệt kê TC **map trực tiếp** với REQ đã đổi:

1. **Ticket có đụng thứ nhìn thấy được trên màn hình không** (thêm/bớt field, đổi nhãn, đổi vị trí, đổi giá trị mặc định)? → TC `UI cơ bản` ở **Vòng 1** phải cập nhật, **không chỉ** TC validation ở Vòng 2. Sửa xong V2 mà quên V1 là kiểu hụt phổ biến nhất của DELTA
2. Field đổi thành bắt buộc → **TC nào khác dùng field đó ở bước phụ** mà giờ sẽ fail?
3. TC vừa Deprecated → **TC nào lấy nó làm precondition**?
4. Thêm field mới → **bảng 15 loại field** của loại đó đã đối soát đủ từng mục chưa, hay mới sinh 2–3 TC cho xong?
5. Thêm TC mới có làm file **vượt ngưỡng 40 TC** → phải tách `parts/`?

## Quality Gate DELTA (8 tiêu chí)

- [ ] **1.** Mọi TC ID giữ nguyên — không TC nào bị đổi số hay đánh lại từ `001`
- [ ] **2.** Tên file index không đổi — không có file `_improved` / `_v2` / thư mục `archive/` nào
- [ ] **3.** Không dòng TC nào bị xoá — TC gỡ đều mang **cả** tag `@Deprecated` **và** tiền tố `🗑️ Deprecated (<mã ticket>, <ngày>) —` ở `Test Scenario`
- [ ] **4.** Bảng Đối Soát Coverage khớp lại — mọi REQ 🟡 (đã sửa) và REQ chưa đổi còn active có ≥1 TC **không** `@Deprecated`. REQ 🔴 không còn TC active là **đúng**, ghi lý do. REQ 🟢 (mới) **không** chấm ở gate này — liệt kê ở *Ngoài phạm vi* kèm workflow sinh bổ sung
- [ ] **5.** **Bảng Đối soát loại kiểm thử (4 vòng)** cập nhật **đúng những nhánh ticket chạm tới**, giữ nguyên phần còn lại — KHÔNG rà lại cả module. Ticket đụng thành phần màn hình mà nhánh `V1 · UI cơ bản` không đổi gì = **dấu hiệu đã bỏ sót**
- [ ] **6.** Số TC ở index (Bản đồ tài liệu) khớp tổng số TC của các file nền tảng / `parts/`, tách rõ số TC `@Deprecated`
- [ ] **7.** `docs/testcases/README.md` (danh mục) đã cập nhật: số TC, REQ bao phủ, ngày cập nhật
- [ ] **8.** Có **Nhật ký thay đổi** ở cuối file TC + **Delta TC List ghi ra file** `impact/delta_tc_<TICKET-ID>.md` (cùng hậu tố với Impact Report) — có cột **Nền tảng** và **Vòng · Nhánh**, có đủ dòng `⏸️ @NeedsVerify` của TC chưa sửa được, ghi đúng **mốc git** của từng file nền tảng trước khi sửa
