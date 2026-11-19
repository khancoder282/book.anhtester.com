# Mode 2: FULL RBT — Quy Trình AI-RBT 6 Bước

## Mục đích

Quy trình bài bản, tuần tự cho module phức tạp. Bao gồm phân tích Ambiguity, phân rã hệ thống, Traceability Matrix, đánh giá Risk Level, và sinh test cases chi tiết **theo 4 vòng kiểm thử** (Smoke → Functional → Technical → Non-functional).

> ⚠️ **QUAN TRỌNG:** Quy trình này **BẮT BUỘC chạy tuần tự** từng bước. KHÔNG được gộp nhiều bước chạy 1 lần. Mỗi bước phải hoàn thành và được user xác nhận trước khi sang bước tiếp.

### Bước 1: Context & Role-play (Khởi tạo ngữ cảnh)

**Mục đích:** Thiết lập vai trò Senior QA Engineer và nạp bối cảnh dự án.

**Agent phải:**
1. Yêu cầu user cung cấp:
   - Tên dự án / tính năng
   - Mô tả hệ thống hiện tại
   - Mục tiêu kiểm thử MVP
   - Tài liệu yêu cầu (Requirements, User Stories, Figma link, PDF...)
2. **Kiểm module đã có bộ TC chưa** — có thì rẽ nhánh theo mục [Module đã có bộ TC — chế độ BỔ SUNG](#module-đã-có-bộ-tc--chế-độ-bổ-sung-áp-quick--full-rbt) và nêu rõ ở phần xác nhận bối cảnh
3. Đọc kỹ tài liệu và xác nhận đã hiểu bối cảnh
4. Tóm tắt scope kiểm thử
5. **Chờ user xác nhận** trước khi sang Bước 2

> ⚠️ **Bước 1 chưa xong nếu chưa mở evidence.** Trước khi tóm tắt scope, agent phải liệt kê `docs/requirements/<module>/<nền-tảng>/evidence/` và `Read` từng ảnh theo [Quy Tắc Đối Chiếu Evidence](#quy-tắc-đối-chiếu-evidence-bắt-buộc--áp-dụng-cả-4-modes-chạy-trước-batch-đầu-tiên). Kết quả đưa vào Output dưới dạng **Danh mục Evidence** (ảnh nào đủ / cắt cụt / thiếu).

**Output:** Xác nhận hiểu bối cảnh + tóm tắt scope kiểm thử + **Danh mục Evidence đã mở**.

---

### Bước 2: Analysis & QnA (Phân tích yêu cầu)

**Mục đích:** Phân tích tài liệu để phát hiện điểm mờ, thiếu sót, mâu thuẫn.

**Agent phải:**
1. Xác định các luồng:
   - Happy Path (luồng chính)
   - Alternate Paths (luồng rẽ nhánh)
   - Exception Paths (luồng ngoại lệ)
2. Phát hiện Ambiguities:
   - Yêu cầu thiếu sót (không quy định độ dài textbox, timeout, hành vi mất kết nối...)
   - Yêu cầu mâu thuẫn
   - Yêu cầu chưa rõ ràng
   - **Xung đột giữa tài liệu và evidence** — tài liệu mô tả một đằng, ảnh cho thấy một nẻo. Đây là dấu hiệu requirements đã lỗi thời, **bắt buộc đưa vào Q&A**, không tự chọn bên nào
3. Đặt câu hỏi Q&A có đánh số thứ tự (Q1, Q2...) cho user/PO/BA giải đáp, mỗi câu kèm ngữ cảnh và assumption nếu không được trả lời
4. **DỪNG LẠI — Chờ user trả lời** các câu hỏi trước khi tiếp tục

**Output:** Danh sách luồng + Ambiguities + Câu hỏi Q&A.

> [!IMPORTANT]
> **Đây là điểm nghẽn quan trọng nhất.** Nếu agent bỏ qua bước này và tự đoán logic, test cases sẽ sai nghiêm trọng. Agent PHẢI dừng lại và đợi user phản hồi.

---

### Bước 3: Decomposition (Phân rã hệ thống)

**Mục đích:** Chia tính năng phức tạp thành các Module / Sub-module nhỏ, dễ quản lý.

**Agent phải:**
1. Phân rã theo 1 trong 2 cách:
   - **Theo UI:** Header, Data Table, Form popup, Sidebar...
   - **Theo luồng:** Flow tạo mới, Flow chỉnh sửa, Flow xóa...
2. Mô tả ngắn gọn chức năng từng Module
3. Chỉ ra Dependencies giữa các Module

**Output:** Danh sách Modules/Sub-modules + Dependencies.

---

### Bước 4: Traceability (Đảm bảo độ bao phủ)

**Mục đích:** Thiết lập ma trận truy vết để đảm bảo 100% requirements được phủ test scenarios.

**Agent phải:**
1. Map mỗi Module/Rule với mã Yêu cầu (REQ-01, REQ-02...)
2. Cross-check xem có yêu cầu nào bị thiếu trong danh sách phân rã (Gap Analysis)
3. Liệt kê High-Level Test Scenarios cho từng Module, **xếp theo 4 vòng** (xem [Bản Đồ Loại Kiểm Thử — 4 Vòng](#bản-đồ-loại-kiểm-thử--4-vòng-bắt-buộc--khung-sinh-tc-cho-quick--full-rbt--delta)):
   - **V1 Smoke:** giao diện cơ bản · mở form · hiển thị · nhập hợp lệ · lưu · đối chiếu dữ liệu
   - **V2 Functional:** hành vi giao diện · bắt buộc · validation · EP · BVA · quy tắc nghiệp vụ · bảng quyết định · chuyển trạng thái · phụ thuộc · kịch bản nghiệp vụ · CRUD · đoán lỗi
   - **V3 Technical:** phân quyền · bảo mật · API · CSDL · tích hợp · nhật ký
   - **V4 Non-functional:** tương thích · đáp ứng · bàn phím/trợ năng · hiệu năng · hồi quy · xuyên module
   > Chấm sơ bộ mỗi nhánh `✅ sẽ sinh` / `➖ không áp dụng (lý do kỹ thuật)` / `⏭️ cố ý bỏ (lý do + ai quyết + điều kiện rà lại)` **ngay ở bước này** — đây là lúc user review rẻ nhất, trước khi sinh TC chi tiết.
4. **Chấm mức rủi ro từng Module** theo bảng tiêu chí mục [Độ sâu theo rủi ro](#độ-sâu-theo-rủi-ro--không-phải-chức-năng-nào-cũng-chạy-đủ-4-vòng) — agent tự chấm, ghi căn cứ, KHÔNG hỏi user — rồi nêu **độ sâu tương ứng** (Đầy đủ / Tiêu chuẩn / Tối giản) kèm số TC ước tính. Chấm ở bước này để user phủ quyết ngay tại checkpoint, không phải sau khi đã sinh xong
5. **Chờ user review** danh sách scenarios, bảng 4 vòng và mức rủi ro trước khi sinh test case chi tiết

**Output:** Traceability Matrix + High-Level Test Scenarios + mức rủi ro · độ sâu từng Module.

---

### Bước 5: RBT & TC Generation (Sinh Test Case chi tiết)

**Mục đích:** Sinh test cases chi tiết theo chiến lược Risk-Based Testing.

**Agent phải:**
1. Áp **mức rủi ro đã được user duyệt ở Bước 4** (user sửa mức nào thì theo mức user sửa) — mức rủi ro quyết định độ sâu:
   - **Cao** → độ sâu **Đầy đủ**: đủ mọi nhánh của cả 4 vòng (40–60 TC)
   - **Trung bình** → độ sâu **Tiêu chuẩn**: V1 + V2 đủ, V3 giới hạn ở `Permission`/`Security`, V4 giới hạn ở `Responsive`/`Accessibility` (20–30 TC)
   - **Thấp** → độ sâu **Tối giản**: V1 đủ 6 nhánh (**không rút**), V2 chỉ nhánh có ràng buộc thật, V3/V4 phần lớn `⏭️` (8–12 TC)
   > ⚠️ Lưỡng lự thì chấm **mức cao hơn**. Bốn thứ không bao giờ rút: toàn bộ V1 · `Required`+`Validation` khi có field nhập · `Permission` khi ≥2 vai trò · `Security` khi chạm dữ liệu người dùng khác.
2. Sinh test case với đầy đủ fields:
   - Module / Sub-module
   - **REQ ID** (mã requirement mà TC cover — lấy từ Traceability Matrix ở Bước 4)
   - Test Case Title
   - Pre-conditions
   - Test Steps (**đánh số 1,2,3 — mỗi bước 1 hành động**, theo Quy Tắc Trình Bày Test Steps)
   - Expected Results (đánh số khớp 1-1 với steps)
   - Test Data (**phải cụ thể**, không dùng placeholder chung chung)
   - Priority
3. **Sinh tuần tự theo 4 vòng** — V1 Smoke → V2 Functional → V3 Technical → V4 Non-functional. Mỗi batch **nằm trọn trong một vòng**, không trộn vòng.
   Vòng 1 luôn mở đầu bằng nhánh `UI cơ bản` (nhãn nguyên văn · thứ tự field · trạng thái mặc định) — đây là lớp bị bỏ sót nhiều nhất.
   Bao phủ đa dạng trong từng vòng:
   - Happy Path
   - Negative Path (giá trị biên, vượt ký tự)
   - Edge Cases (timeout, mất kết nối...)
4. **Áp dụng kỹ thuật theo Quy Tắc Bắt Buộc:** EP+BVA cho field có ràng buộc; **Decision Table** khi ≥3 điều kiện kết hợp; **State Transition** khi có status flow (xem section Quy Tắc Bắt Buộc Áp Dụng Kỹ Thuật)
5. **Validation chuyên biệt từng trường (Field-Level Validation):**
   - Liệt kê **tất cả input fields** trên form/UI đang test
   - Sinh validation TCs **riêng cho TỪNG trường** theo đặc tính riêng (15 loại input field types)
   - **KHÔNG** gộp validation của **các trường khác nhau** vào 1 TC — biến thể **cùng một trường** thì gộp theo độ hạt đã chốt (xem mục Độ Hạt Test Case)
6. **Bao phủ Component-Level Checklist:** Data Table/List, CRUD Lifecycle, Permission/Role (đối chiếu Ma trận Phân quyền), Modal/Dialog, Notification, Status Flow (đối chiếu Ma trận Trạng thái)
7. **Tích hợp Scenarios Chuyên Sâu & Non-Functional:** Race Condition/Double Submit, Session/Network Resilience, Localization/UTF-8/Emoji, Keyboard Accessibility (A11y), HTTP Status Codes.
8. Nếu scenarios quá nhiều → chia batch theo **Module → Vòng**, sinh lần lượt từng Module nhưng **chạy thẳng hết** theo Quy Tắc Xuất File mục 3 — KHÔNG dừng hỏi giữa các batch. Checkpoint của FULL RBT chỉ nằm ở Bước 2 và Bước 4

**Output:** Danh sách Test Cases chi tiết có Risk Level.

---

### Bước 6: Template Mapping (Chuẩn hóa Format & Metadata)

**Mục đích:** Đóng gói test cases thành bảng Markdown chuẩn đầy đủ metadata cho Automation, sẵn sàng copy sang Excel/Jira hoặc sync vào Google Sheets.

**Agent phải:**
1. Chuẩn hóa toàn bộ test cases vào bảng Markdown:

```markdown
| TC ID | REQ ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automation | Auto Type | Tags |
```

2. Quy tắc bảng:
   - TC ID theo format thống nhất (ví dụ: `CRM_CUST_TC_001`)
   - **REQ ID bắt buộc mỗi dòng** — TC không trỏ về REQ nào là TC mồ côi, phải xem lại
   - Test Steps đánh số `1. 2. 3.` (mỗi bước 1 hành động), Expected Result đánh số khớp 1-1, dùng `<br>` xuống dòng trong cell
   - Gắn đầy đủ metadata `Automation` (`Yes`/`No`/`Partial` — chấm theo [Tiêu chí chấm cột Automation](automation_criteria.md)), `Auto Type` (`UI`/`API`/`Unit`/`N/A`), và `@Tags` (`@Smoke`, `@Regression`, `@CriticalPath`...)
   - **TUYỆT ĐỐI không được bỏ sót** bất kỳ test case nào đã sinh ở Bước 5
3. **Chạy Self-Quality Gate (11 Tiêu chí, 0–10):** Kiểm định lại — bao gồm **Bảng Đối Soát Coverage** (tiêu chí 6: mọi REQ có ≥1 TC), **Bảng Đối Soát Evidence** (tiêu chí 7), **rà ngôn ngữ kiểm chứng** (tiêu chí 8), **Bảng rà soát đặc tính chất lượng ISO/IEC 25010:2023** (tiêu chí 9: đủ 9/9 đặc tính, ô `➖` ghi rõ ai chịu) và **Bảng Đối soát loại kiểm thử 4 vòng** (tiêu chí 10: mọi nhánh được chấm, 3 nhánh cấm `➖`, độ hạt GỘP ghi kèm số biến thể) — trước khi xuất Artifact (`TEST_CASES_<TÊN_MODULE>_SUMMARY.md`).

**Output:** Bảng Test Cases Markdown hoàn chỉnh kèm Metadata Automation.
