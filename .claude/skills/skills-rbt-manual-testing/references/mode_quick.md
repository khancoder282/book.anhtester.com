# Mode 1: QUICK — Sinh Test Cases Nhanh

## Mục đích

Sinh test cases **nhanh, đủ chất lượng** từ requirements/user stories đã rõ ràng, phù hợp cho module đơn giản hoặc khi cần kết quả ngay.

## Quy trình (1 lượt duy nhất)

**Agent phải:**

0. **Kiểm module đã có bộ TC chưa** — có thì rẽ nhánh theo mục [Module đã có bộ TC — chế độ BỔ SUNG](#module-đã-có-bộ-tc--chế-độ-bổ-sung-áp-quick--full-rbt)
1. **Đọc và hiểu requirements** được cung cấp
   - Nếu requirements đã có mã REQ ID (từ `skills-requirements-analyzer`) → dùng nguyên mã đó
   - Nếu chưa có mã → agent tự gán `REQ-<MODULE>-<SỐ>` cho từng yêu cầu/rule trước khi sinh TC
2. **Mở toàn bộ evidence** theo [Quy Tắc Đối Chiếu Evidence](#quy-tắc-đối-chiếu-evidence-bắt-buộc--áp-dụng-cả-4-modes-chạy-trước-batch-đầu-tiên) — liệt kê `docs/requirements/<module>/<nền-tảng>/evidence/` và `Read` từng ảnh. **Chưa làm xong bước này thì chưa được ghi dòng TC đầu tiên.** Ghi lại ảnh nào cắt cụt / vùng nào không có ảnh để dùng ở bước 10
3. **Ghi nhận Assumptions (BẮT BUỘC khi requirement mơ hồ):**
   - QUICK mode không dừng hỏi Q&A → mọi điểm không rõ agent phải **ghi rõ giả định** đã dùng
   - Xuất mục "Assumptions" ngay đầu output: `ASM-XX | Điểm chưa rõ | Giả định đã áp dụng | TC bị ảnh hưởng`
   - KHÔNG được đoán ngầm mà không ghi lại
4. **Xác định các luồng chính:**
   - Happy Path (luồng chính)
   - Negative Path (dữ liệu sai, thiếu)
   - Boundary Cases (giá trị biên)
4b. **Lập kế hoạch theo 4 vòng (BẮT BUỘC — làm TRƯỚC khi ghi dòng TC đầu tiên):**
   - Duyệt [Bản Đồ Loại Kiểm Thử — 4 Vòng](#bản-đồ-loại-kiểm-thử--4-vòng-bắt-buộc--khung-sinh-tc-cho-quick--full-rbt--delta), chấm sơ bộ từng nhánh `✅ sẽ sinh` / `➖ không áp dụng (lý do)`
   - Sinh **tuần tự V1 → V2 → V3 → V4**, KHÔNG nhảy cóc. Vòng 1 luôn mở đầu bằng nhánh `UI cơ bản`
   - Công bố kế hoạch batch theo vòng ra chat trước khi sinh
5. **Áp dụng kỹ thuật thiết kế test case** theo Quy Tắc Bắt Buộc Áp Dụng Kỹ Thuật (xem section riêng):
   - **Equivalence Partitioning (EP):** Chia input thành nhóm tương đương
   - **Boundary Value Analysis (BVA):** Test giá trị tại ranh giới
   - **Decision Table:** Liệt kê tổ hợp điều kiện (nếu có nhiều rules)
   - **State Transition:** Test chuyển đổi trạng thái (nếu có workflow)
6. **Validation chuyên biệt từng trường (Field-Level Validation):**
   - Liệt kê **tất cả input fields** trên form/UI
   - Sinh validation test cases **riêng cho TỪNG trường** dựa theo Bảng Checklist 15 loại field
   - **KHÔNG** gộp validation của **các trường khác nhau** vào 1 test case (xem CẤM gộp ở mục Độ Hạt)
   - Ở độ hạt **GỘP** (mặc định): các biến thể **cùng một trường** cho cùng loại phản hồi thì nằm chung 1 TC dưới dạng Bảng biến thể (Kiểu A). Ở độ hạt **TÁCH**: mỗi biến thể một TC
7. **Bao phủ Component-Level Checklist:** Data Table/List, CRUD Lifecycle, Permission/Role, Modal/Dialog, Notification (xem bảng riêng bên dưới)
8. **Bao phủ các Scenarios Chuyên sâu & Non-Functional:**
   - Race Condition & Double Submit
   - Session & Network Resilience
   - Localization & UTF-8 / Emoji
   - Keyboard Accessibility (A11y)
   - HTTP Status Codes (cho API TCs)
9. **Xuất ra bảng Markdown** chuẩn có đầy đủ metadata cho Automation, sẵn sàng sync vào Google Sheets hoặc Jira/TestRail. Cột `Automation` chấm theo [Tiêu chí chấm cột Automation](automation_criteria.md), ghi mục `## Đối soát cột Automation` vào index.
10. **Chạy Self-Quality Gate (11 Tiêu chí, 0–10):** Rà soát lại 100% test cases + đối soát coverage (6) + đối soát evidence (7) + **rà ngôn ngữ kiểm chứng** (8) + **rà đặc tính chất lượng ISO/IEC 25010** (9) + **đối soát loại kiểm thử 4 vòng** (10) trước khi xuất kết quả.
