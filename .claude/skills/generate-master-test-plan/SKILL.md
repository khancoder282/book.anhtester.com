---
name: generate-master-test-plan
description: Sinh Master Test Plan cấp quản lý — kiểm soát tài liệu, phạm vi theo module × nền tảng, cấp độ & loại kiểm thử (kể cả phi chức năng), chiến lược tự động hoá, tiêu chí vào/ra, môi trường, dữ liệu kiểm thử, quản lý lỗi, nhân lực, lịch, ước lượng & ngân sách, rủi ro. Đầu vào là phiếu YAML plans/master-test-plan/test_plan.config.yaml do người dùng điền. Bám ISO/IEC/IEEE 29119-3 và đủ nội dung điển hình của ISTQB CTFL v4.0. KHÔNG phải danh sách test scenario.
argument-hint: "[phiếu YAML, mặc định plans/master-test-plan/test_plan.config.yaml]"
---

> **Skill nền tảng cần nạp trước:** `skills-test-summary-reporter` · `skills-requirements-analyzer` · `skills-rbt-manual-testing` — đọc `.claude/skills/<tên-skill>/SKILL.md` của từng skill trước khi bắt đầu.

# Workflow: Master Test Plan

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp **`skills-test-summary-reporter`** — mục **Tiêu chí Exit** là **nguồn duy nhất** định nghĩa bộ tiêu chí ra mặc định. Plan này công bố tiêu chí **trước**, `/generate-test-progress-report` theo dõi **trong đợt**, `/generate-test-summary-report` chấm lại **sau**. Ba bên phải khớp, nếu không thì lúc release sẽ cãi nhau về chuẩn.

Tài liệu quản lý một đợt kiểm thử: **ai làm gì, trong phạm vi nào, tốn bao nhiêu công sức, khi nào bắt đầu được, khi nào coi là xong.**

## ⚠️ Chọn đúng workflow

| User cần | Workflow đúng | Đầu ra |
|---|---|---|
| *"Test cái gì trước, có những kịch bản nào"* | `/generate-application-test-plan` | Scenario + priority, **không** quản lý |
| *"Hệ thống có module nào"* | `/discover-system` | Bản đồ module + prefix |
| *"Tài liệu kế hoạch để gửi PM/khách ký"* | **Workflow này** | Master Test Plan |
| *"Tuần này test tới đâu rồi"* | `/generate-test-progress-report` | Báo cáo tiến độ một kỳ |
| *"Có release được không"* | `/generate-test-summary-report` | Báo cáo tổng hợp cuối mốc |

> Workflow này **không sinh test scenario, không sinh TC**. Nó nói *cách tổ chức việc kiểm thử*, không nói *kiểm thử cái gì cụ thể*.

## ⚠️ Nguyên tắc thực thi

- **Tất cả output bằng Tiếng Việt**, viết cho PM/khách hàng đọc
- **KHÔNG BỊA** lịch, nhân lực, ngày mốc, tên người, công sức, ngân sách — agent không có cách nào biết. Thiếu thì để `❓ Chờ <ai> cung cấp`, **không** điền số cho đủ chỗ
- **Hai nguồn dữ liệu, không trộn vai:** thứ suy ra được lấy từ `docs/` (module, nền tảng, độ phủ, môi trường đã khảo sát, năng lực QA, vùng đã loại) — thứ chỉ người biết lấy từ **phiếu YAML đầu vào**. Không hỏi lại thứ `docs/` đã có
- Tiêu chí exit mặc định lấy **nguyên văn** từ `skills-test-summary-reporter` — không rút gọn câu chữ. Dự án muốn thêm thì thêm ở bảng **bổ sung**, không sửa bảng mặc định
- Thang **Severity / Priority** mặc định ở mục 9 lấy **nguyên văn** từ `skills-bug-reporter` mục *Severity & Priority Guide* — cùng lý do: tiêu chí exit #1, #2 đếm bug theo Severity, thang lệch là đếm lệch. Dự án dùng thang riêng thì khai ở phiếu, không sửa bảng mặc định
- **KHÔNG bịa thời hạn xử lý lỗi (SLA)** — không có mặc định; phiếu trống → `❓`
- **Phạm vi khai theo cặp module × nền tảng** (`web` · `mobile` · `api`) — cùng đơn vị mà báo cáo tiến độ và báo cáo tổng hợp dùng
- **KHÔNG bịa số điều khoản chuẩn** — xem mục Chuẩn tham chiếu
- 🔒 URL, tài khoản, token nằm ở `.env` — **không** ghi vào plan, **không** ghi vào phiếu YAML

---

## Chuẩn tham chiếu — vì sao cần và ghi thế nào

Template bám khung **Test Plan** của **ISO/IEC/IEEE 29119-3** (chuẩn hiện hành về tài liệu kiểm thử, thay thế họ IEEE 829 — bản 829-2008 đã bị thay thế, *superseded*) và phủ đủ **nội dung điển hình của test plan** mà **ISTQB CTFL v4.0** liệt kê ở mục *5.1.1 Purpose and Content of a Test Plan*. Nhiều khách hàng Nhật/Mỹ vẫn quen **khung Test Plan 16 mục của IEEE 829-1998** — nên plan ánh xạ sang **cả ba**.

**Mục đích:** khi nghiệm thu hợp đồng, audit, hoặc người duyệt có chứng chỉ ISTQB hỏi *"plan này theo chuẩn nào, có thiếu mục nào không"* — trả lời bằng một trang.

### Ba nguồn có bản chất khác nhau — ghi đúng quan hệ

| Nguồn | Bản chất | Câu được phép viết trong plan |
|---|---|---|
| **ISO/IEC/IEEE 29119-3** | Chuẩn tài liệu kiểm thử | *"Biên soạn **theo cấu trúc** ISO/IEC/IEEE 29119-3 — Test Plan"* |
| **ISTQB CTFL v4.0** | **Giáo trình** chứng chỉ, liệt kê *"typical content"* kèm *"e.g."* — không phải chuẩn để tuyên bố tuân thủ. Chính giáo trình trỏ sang 29119-3 để xem chi tiết | *"Phủ đủ nội dung điển hình của test plan theo ISTQB CTFL v4.0, mục 5.1.1"* |
| **IEEE 829-1998** | Chuẩn cũ, đã bị thay thế | *"Ánh xạ sang khung Test Plan của IEEE 829-1998 để tham khảo"* |

> ⚠️ **KHÔNG** viết *"tuân thủ ISO/IEC/IEEE 29119"* hay *"đạt chuẩn ISTQB"*. Tuân thủ là kết luận của đánh giá viên; ISTQB không cấp chứng nhận cho tài liệu.

### Nội dung điển hình theo ISTQB CTFL v4.0 — mục 5.1.1 (nguyên văn giáo trình)

Đã đối chiếu với bản giáo trình **v4.0 phát hành 21-04-2023**. Mọi dòng dưới đây **phải có mục tương ứng** trong plan:

| ISTQB CTFL v4.0 — 5.1.1 | Mục trong plan |
|---|---|
| Context of testing — scope · test objectives · constraints · test basis | 2.1 · 2.2 · 1.1 · 2.3 · 1.2 |
| Assumptions and constraints of the test project | 2.3 |
| Stakeholders — roles · responsibilities · relevance to testing · hiring and training needs | 2.4 · 6 |
| Communication — forms and frequency of communication · documentation templates | 2.4 |
| Risk register — product risks · project risks | 8.2 · 8.1 |
| Test approach — test levels · test types · test techniques · test deliverables · entry criteria and exit criteria · independence of testing · metrics to be collected · test data requirements · test environment requirements · deviations from the organizational test policy and test strategy | 3.1 · 3.2 (+ 3.2.1 phi chức năng) · 3.3 · 10 · 4.1–4.2 · 3.4 · 3.6 · 5.2 · 5.1 · 12.2 |
| Budget and schedule | 7.3 · 7.1 · 7.2 |

Các điểm của **mục 5.1.3 Entry Criteria and Exit Criteria** được đưa vào template:
- Tiêu chí vào gồm **đủ nguồn lực** (người, công cụ, môi trường, dữ liệu, ngân sách, thời gian) · **đủ testware** · **chất lượng ban đầu** (smoke đã pass)
- Tiêu chí vào/ra **nên định nghĩa theo từng cấp độ kiểm thử** → cột *Tiêu chí riêng* ở mục 3.1
- **Hết thời gian/ngân sách cũng là tiêu chí ra hợp lệ** nếu stakeholder đã xem xét và chấp nhận rủi ro → ghi chú bắt buộc ở mục 4.2

### Bảng ánh xạ ba chuẩn

| Mục trong plan | ISO/IEC/IEEE 29119-3 — Test Plan | ISTQB CTFL v4.0 — 5.1.1 | IEEE 829-1998 — Test Plan |
|---|---|---|---|
| Kiểm soát tài liệu | Document-specific information — Unique identification · Issuing organization · Approval authority · Change history | — | Test plan identifier |
| 1.1 Mục tiêu kiểm thử | Introduction — Scope · Context of the testing — Project/test sub-process | Context of testing — test objectives | Introduction |
| 1.2 Cơ sở kiểm thử | Context of the testing — Test item(s) | Context of testing — test basis | Introduction |
| 2.1 Trong phạm vi | Context of the testing — Test item(s) · Test scope | Context of testing — scope | Test items · Features to be tested |
| 2.2 Ngoài phạm vi | Context of the testing — Test scope (phần loại trừ) | Context of testing — scope | Features not to be tested |
| 2.3 Giả định & ràng buộc | Context of the testing — Assumptions and constraints | Assumptions and constraints of the test project · Context of testing — constraints | — |
| 2.4 Các bên liên quan & giao tiếp | Context of the testing — Stakeholders · Testing communication | Stakeholders — roles, relevance to testing · Communication — forms and frequency of communication, documentation templates | — |
| 3.1 Cấp độ kiểm thử | Test strategy — Test sub-processes | Test approach — test levels | Approach |
| 3.2 Loại kiểm thử | Test strategy — Test sub-processes | Test approach — test types | Approach |
| 3.2.1 Kiểm thử phi chức năng | Test strategy — Test sub-processes · Test design techniques | Test approach — test types | Approach |
| 3.3 Kỹ thuật thiết kế test | Test strategy — Test design techniques | Test approach — test techniques | Approach |
| 3.4 Mức độc lập của kiểm thử | Staffing — Roles, activities, and responsibilities | Test approach — independence of testing | Responsibilities |
| 3.5 Retest & regression | Test strategy — Retesting and regression testing | Test approach — test types | Approach |
| 3.6 Chỉ số theo dõi | Test strategy — Metrics to be collected | Test approach — metrics to be collected | — |
| 3.7 Chiến lược tự động hoá | Test strategy — Test sub-processes | Test approach — test types *(kim tự tháp kiểm thử: CTFL v4.0 mục 5.1.6)* | Approach |
| 4.1 Tiêu chí vào | Test strategy | Test approach — entry criteria | — |
| 4.2 Tiêu chí ra | Test strategy — Test completion criteria | Test approach — exit criteria | Item pass/fail criteria |
| 4.3 Tạm dừng & tiếp tục | Test strategy — Suspension and resumption criteria | — | Suspension criteria and resumption requirements |
| 5.1 Môi trường kiểm thử | Test strategy — Test environment requirements | Test approach — test environment requirements | Environmental needs |
| 5.2 Quản lý dữ liệu kiểm thử | Test strategy — Test data requirements | Test approach — test data requirements | Environmental needs |
| 5.3 Công cụ | Test strategy — Test environment requirements | — *(công cụ: CTFL v4.0 chương 6)* | Environmental needs |
| 6. Nhân lực & phân công | Staffing — Roles, activities, and responsibilities · Hiring needs · Training needs | Stakeholders — responsibilities, hiring and training needs | Responsibilities · Staffing and training needs |
| 7.1 Lịch trình & mốc | Schedule | Budget and schedule | Schedule |
| 7.2 Ước lượng công sức | Testing activities and estimates | Budget and schedule | Testing tasks |
| 7.3 Ngân sách | Testing activities and estimates | Budget and schedule | — |
| 8.1 Rủi ro dự án | Risk register — Project risks | Risk register — project risks | Risks and contingencies |
| 8.2 Rủi ro sản phẩm (tóm tắt) | Risk register — Product risks | Risk register — product risks | Risks and contingencies |
| 9. Quản lý lỗi | — *(không có mục riêng trong Test Plan; báo cáo sự cố là tài liệu riêng — Incident Report)* | — *(quản lý lỗi: CTFL v4.0 mục 5.5)* | — *(Test incident report là tài liệu riêng)* |
| 10. Sản phẩm bàn giao | Test strategy — Test deliverables | Test approach — test deliverables | Test deliverables |
| 11. Phê duyệt | Document-specific information — Approval authority | — | Approvals |
| 12.2 Điểm làm khác chính sách & chiến lược chung | Test strategy — Deviations from the Organizational Test Strategy | Test approach — deviations from the organizational test policy and test strategy | — |

> ⚠️ **Hai bản IEEE 829 có cấu trúc KHÁC nhau.** Khung 16 mục phẳng ở cột cuối là **829-1998**. Bản **829-2008** tách thành Master Test Plan và Level Test Plan với dàn mục lồng nhau — khách yêu cầu đúng 829-2008 → **xin file template của khách** rồi ánh xạ theo file đó.
>
> ⚠️ **Tên mục 29119-3** ghi theo khung Test Plan của chuẩn; giữa các bản phát hành có điều chỉnh tên gọi. Agent **không có** bản chuẩn để tra → trước khi đem đi audit, người có bản chuẩn phải **đối chiếu lại cột này** — ghi việc đó vào danh sách ô còn treo. Cột **ISTQB** đã đối chiếu nguyên văn giáo trình v4.0; bản sửa lỗi v4.0.1 **chưa** đối chiếu.
>
> ⚠️ **Mục 9 Quản lý lỗi và 3.7 Tự động hoá là phần mở rộng** so với khung chuẩn — thêm vì PM/khách cần thấy ngay trong plan *lỗi được phân loại, xử lý thế nào* và *tự động hoá tới đâu*. Không mục nào của 29119-3 bị bỏ; chỉ thêm. Mục 12.1 phải ghi rõ hai mục này là mở rộng, **không** gán cho chúng một tên mục chuẩn không có thật.
>
> ⚠️ **Quy tắc ghi chuẩn:** ghi **tên mục**, **KHÔNG ghi số điều khoản** (`clause 7.3.2`) của 29119-3 và 829. Riêng ISTQB được ghi số mục giáo trình (`5.1.1`) vì đã đối chiếu trực tiếp bản v4.0.

---

## Phiếu cấu hình `test_plan.config.yaml`

Thông tin **chỉ người mới biết** được gom vào một phiếu YAML, thay cho việc hỏi đáp rời rạc:

```
plans/master-test-plan/test_plan.config.yaml     ← PHIẾU CẤU HÌNH CHÍNH — người dùng điền trực tiếp
docs/test-plans/test_plan_<slug>.input.yaml      ← BẢN LƯU của phiếu tại lần lập/cập nhật plan — agent tự ghi, commit cùng plan
```

> Vì sao cần bản lưu: `test_plan.config.yaml` được **sửa lại cho mỗi đợt**. Không lưu bản sao theo slug thì plan đã duyệt mất căn cứ đầu vào, và lần cập nhật sau không so được phiếu đổi gì.

### Vì sao YAML, khoá tiếng Việt có dấu, có chú thích

Người điền phiếu là QA Lead / PM / PO — **không** mở workflow này để tra ô nào nghĩa là gì. Vì vậy phiếu tự mang hướng dẫn:

- **Tên ô là tiếng Việt có dấu, có khoảng trắng** (`Đóng băng mã nguồn`, `Người dựng`) — đọc như một biểu mẫu giấy
- **Chú thích `#` cạnh ô** ghi giá trị hợp lệ; **tiêu đề nhóm** ghi `BẮT BUỘC` / `tuỳ chọn` và ai thường nắm thông tin
- Nhóm xếp **theo thứ tự điền**: mốc → kiểm soát tài liệu → phạm vi → lịch → nhân lực → môi trường, dữ liệu, công cụ → cấp độ, loại, phi chức năng, tự động hoá → … → quản lý lỗi → tiêu chí → … → chuẩn tổ chức
- Danh sách rỗng có **phần tử mẫu nằm trong chú thích** — người điền bỏ `#` là có cấu trúc đúng

Chú thích là **khung cố định của phiếu**; chỉ phần sau dấu hai chấm là dữ liệu dự án.

### Cấu trúc và giá trị hợp lệ

Agent dùng bảng này để kiểm phiếu ở Bước 2. Khoá trong bảng khớp **từng ký tự** với phiếu mẫu.

| Nhóm | Ô · giá trị hợp lệ | Nuôi mục |
|---|---|---|
| `Mốc` ⚠️ bắt buộc | `Tên` · `Mã mốc` (chữ thường, không dấu, nối `_`) · `Phiên bản phần mềm` · `Hệ thống` (danh sách; repo một hệ thống → trống) | Kiểm soát tài liệu · tên file · 2.1 |
| `Kiểm soát tài liệu` | `Người lập` (trống = người có vai trò `trưởng nhóm QA` ở `Nhân lực`) · `Người review` — danh sách `{Tên, Vai trò}` · `Mức phân loại` ∈ `công khai` · `nội bộ` · `mật` | Kiểm soát tài liệu |
| `Phạm vi` ⚠️ bắt buộc | `Trong phạm vi` — danh sách `{Module, Nền tảng, Ghi chú}`: `Module` là prefix trong danh mục · `Nền tảng` ⊂ `web` · `mobile` · `api`<br>`Ngoài phạm vi bổ sung` — danh sách `{Nội dung, Lý do, Người chịu trách nhiệm, Người quyết định, Ngày quyết định}` — chỉ phần **chưa** có trong `docs/`<br>`Đưa lại REQ bị loại vì môi trường`: `có` · `không` | 2.1 · 2.2 |
| `Lịch` | `Duyệt kế hoạch` · `Hoàn tất viết TC` · `Môi trường sẵn sàng` · `Bắt đầu thực thi` · `Đóng băng mã nguồn` · `Hồi quy từ` · `Hồi quy đến` · `Nghiệm thu từ` · `Nghiệm thu đến` · `Báo cáo tổng hợp` · `Phát hành`: ngày `DD-MM-YYYY`<br>`Tần suất báo cáo tiến độ` ∈ `hằng ngày` · `hằng tuần` · `hai tuần` · `Ngày gửi báo cáo tiến độ`: chữ tự do | 7.1 · 5 |
| `Nhân lực` | Danh sách `{Tên, Vai trò, Phụ trách, Cần đào tạo}` — `Vai trò` ∈ `trưởng nhóm QA` · `kiểm thử viên` · `tự động hoá` · `khác` · `Phụ trách`: danh sách `Toàn bộ` hoặc `MODULE × nền tảng` | 6 |
| `Cần tuyển thêm người` | `có` (kèm vị trí) · `không` | 6 |
| `Môi trường` | `Tên` · `Dùng chung với đội khác`: `có` · `không` · trống = theo `docs/requirements/README.md` · `Người dựng` · `Trình duyệt` (danh sách) · `Thiết bị mobile` (danh sách) | 5.1 |
| `Dữ liệu kiểm thử` | `Dữ liệu nền` (mô tả) · `Nguồn dữ liệu` — danh sách ⊂ `tự sinh khi chạy` · `nạp sẵn` · `bản sao production đã che` · `nhập tay` · `Có dữ liệu thật của khách hàng`: `có` · `không` · `Cách che dữ liệu` (chỉ khi có dữ liệu thật) · `Dọn dữ liệu sau khi chạy`: `có` · `không` · `Làm mới dữ liệu nền` · `Người cung cấp` | 5.2 |
| `Công cụ` | `Quản lý lỗi` · `Quản lý kết quả kiểm thử` · `Nguồn chính khi lệch` · `Tự động hoá` · `Khác` (danh sách) | 5.3 |
| `Cấp độ kiểm thử` | 5 ô con cố định `Thành phần` · `Tích hợp thành phần` · `Hệ thống` · `Tích hợp hệ thống` · `Chấp nhận`, mỗi ô `{Trong đợt: có · không, Ai thực hiện, Tiêu chí riêng}` — `Tiêu chí riêng` trống = dùng bộ chung | 3.1 |
| `Độc lập kiểm thử` | `Mức độ` ∈ `tác giả tự kiểm thử` · `đồng nghiệp cùng đội` · `đội QA riêng trong tổ chức` · `bên ngoài tổ chức` · `Ghi chú` | 3.4 |
| `Loại kiểm thử` | `Chức năng` · `Hồi quy` · `Kiểm thử lại lỗi` · `Tích hợp liên module` · `Tự động hoá` · `Nghiệm thu (UAT)` · `Hiệu năng` · `Bảo mật chuyên sâu` · `Tương thích` · `Khả năng truy cập` · `Khả dụng` · `Độ tin cậy và phục hồi`: `có` · `không`<br>`Bên thực hiện nghiệm thu`: chữ tự do<br>`Cách chạy mobile` · `Cách chạy API` ∈ `tự động hoá` · `kiểm thử viên tự chạy` · `ngoài phạm vi`<br>`Tỷ trọng thủ công / tự động`: chữ tự do | 3.2 · 3.5 |
| `Phi chức năng` | Danh sách `{Loại, Mục tiêu đo, Ngưỡng chấp nhận, Cách làm, Môi trường, Ai thực hiện}` — `Loại` ∈ `hiệu năng` · `bảo mật` · `tương thích` · `khả năng truy cập` · `khả dụng` · `độ tin cậy và phục hồi`. Chỉ khai loại mà `Loại kiểm thử` ghi `có` | 3.2.1 |
| `Chiến lược tự động hoá` | `Mục tiêu` · `Phạm vi tự động` (danh sách) · `Không tự động` — danh sách `{Nội dung, Lý do}` · `Tầng kiểm thử` (chữ tự do — tỷ trọng unit / API / UI) · `Tiêu chí chọn TC` · `Kích hoạt chạy` — danh sách `{Bộ chạy, Khi nào, Môi trường}`, `Khi nào` ∈ `mỗi commit` · `mỗi merge request` · `hằng đêm` · `mỗi build lên môi trường test` · `trước phát hành` · `chạy tay` · `Hệ thống CI` · `Người bảo trì`. Chỉ khi `Loại kiểm thử` → `Tự động hoá: có` | 3.7 |
| `Mục tiêu` | Danh sách câu mục tiêu; trống → agent đề xuất, đánh dấu chờ duyệt | 1.1 |
| `Ước lượng` | `Kỹ thuật` ∈ `tỷ lệ` · `ngoại suy` · `Wideband Delphi` · `Planning Poker` · `ba điểm` · `không ước lượng`<br>`Tổng công sức (người-ngày)` · `Giả định`<br>`Chi tiết ba điểm` — danh sách `{Hạng mục, Lạc quan, Khả năng nhất, Bi quan}` — chỉ khi `ba điểm`, đơn vị người-ngày | 7.2 |
| `Ngân sách` | `Có ngân sách riêng`: `có` · `không` · `Tổng` · `Đơn vị tiền` · `Hạng mục` — danh sách `{Nội dung, Số tiền}` | 7.3 |
| `Quản lý lỗi` | `Quy trình trạng thái` ∈ `mặc định` · `riêng` · `Quy trình riêng` (mô tả hoặc đường dẫn — chỉ khi `riêng`)<br>`Thang Severity` · `Thang Priority` ∈ `mặc định` · `riêng` · `Thang riêng` — danh sách `{Loại, Mức, Định nghĩa}`, `Loại` ∈ `Severity` · `Priority`<br>`Người phân loại lỗi` · `Họp phân loại lỗi` (tần suất)<br>`Thời hạn xử lý` — danh sách `{Severity, Phản hồi, Sửa xong}` | 9 |
| `Tiêu chí` | `Bộ tiêu chí ra` ∈ `mặc định` · `riêng`<br>`Tiêu chí ra bổ sung` / `Tiêu chí ra riêng` — danh sách `{Tiêu chí, Ngưỡng}`<br>`Người chấp nhận dừng khi hết thời gian hoặc ngân sách`<br>`Dùng ngưỡng tạm dừng đề xuất`: `có` · `không` · `Ngưỡng tạm dừng riêng` (danh sách) | 4.2 · 4.3 |
| `Bên liên quan` | Danh sách `{Tên, Vai trò, Nhận gì, Tần suất, Kênh}` — `Nhận gì` ⊂ `kế hoạch` · `báo cáo tiến độ` · `báo cáo tổng hợp` · `báo cáo lỗi` | 2.4 |
| `Mẫu tài liệu` | `Dùng mẫu có sẵn của repo`: `có` · `không` · `Mẫu riêng` — danh sách `{Tài liệu, Mẫu}` | 2.4 |
| `Phê duyệt` | Danh sách `{Tên, Vai trò}` | Kiểm soát tài liệu · 11 |
| `Chuẩn tổ chức` | `Mẫu của khách` (đường dẫn file, trống = cấu trúc mặc định) · `Có chính sách kiểm thử (Test Policy)` · `Có chiến lược kiểm thử (Test Strategy)`: `có` · `không` · `Điểm làm khác` — danh sách `{Nội dung, Quy định chung, Đợt này làm, Lý do, Người duyệt}` | 12.2 · định dạng xuất |

**Quy ước giá trị:**

| Người điền ghi | Nghĩa | Plan ghi |
|---|---|---|
| Để trống (hoặc danh sách rỗng) | **Chưa chốt** | `❓` + đưa vào danh sách ô còn treo |
| `không` | **Đã quyết định là không** | Ghi rõ "không" — **không** phải ô treo |
| `có` | Đã quyết định là có | Nội dung tương ứng |

**Quy tắc đọc phiếu** (Bước 2):

- **Chuẩn hoá Unicode NFC** cả khoá lẫn giá trị trước khi so — cùng chữ "ệ" có hai cách mã hoá tuỳ bộ gõ (Unikey, EVKey, bàn phím macOS); không chuẩn hoá thì khoá gõ tay trông giống hệt mà không khớp
- So giá trị chọn-từ-danh-sách **không phân biệt hoa thường** và coi `hằng` ≡ `hàng` (`Hằng tuần` = `hằng tuần` = `hàng tuần`)
- Ngày trong phiếu theo **định dạng Việt Nam `DD-MM-YYYY`** (VD `17-09-2026`) — YAML đọc giá trị này là **chuỗi**, agent tự tách ngày · tháng · năm. Chấp nhận thêm `DD/MM/YYYY`. Ngày có năm đứng đầu (`2026-09-17`) cũng nhận vì không thể nhầm. **KHÔNG** hiểu theo kiểu Mỹ `MM-DD-YYYY`: `05-10-2026` là **ngày 5 tháng 10**. Ngày không tồn tại (`31-09-2026`) hoặc thiếu năm → báo sai kèm số dòng, **không** tự sửa
- Ngày **xuất ra plan** cũng viết `DD-MM-YYYY` như mọi tài liệu khác trong `docs/` (quy tắc chung `CLAUDE.md` mục 6b). Chỉ **tên file** giữ dạng năm đứng đầu
- Tên ô không có trong bảng → báo user (thường là gõ sai tên ô), **không** tự đoán ô định nói

> ⚠️ **Agent ghi phiếu** (Nhánh B hoặc khi cập nhật) sửa **tại chỗ phần sau dấu hai chấm** trên khung của phiếu mẫu — **giữ nguyên** mọi chú thích, thứ tự nhóm và tên ô. **Không** dựng lại file bằng thư viện YAML (`yaml.dump` xoá sạch chú thích). Danh sách mới thêm phần tử theo đúng phần tử mẫu trong chú thích. Bản lưu `.input.yaml` là **bản chép nguyên file**, kể cả chú thích.

> Phiếu và bản lưu được **commit**: lần cập nhật sau chỉ cần sửa `test_plan.config.yaml` và chạy lại — agent so **dữ liệu** (bỏ qua chú thích) với bản lưu `test_plan_<slug>.input.yaml` để biết mục nào đổi. 🔒 Vì thế phiếu **tuyệt đối không** chứa URL có token, mật khẩu, API key.
>
> Chuyển sang **dự án mới**: xoá hết phần sau dấu hai chấm trong `test_plan.config.yaml` (giữ tên ô và chú thích), xoá các phần tử danh sách — file nằm trong `plans/` nên không bị xoá cùng `docs/`.

---

## Bước 0: Xác định mốc, phiếu và plan đã có

| Tình huống | Xử lý |
|---|---|
| User không truyền gì | Đọc `plans/master-test-plan/test_plan.config.yaml`. `Mốc` → `Mã mốc` có giá trị → dùng. Phiếu còn trống (`Mốc` và `Phạm vi` → `Trong phạm vi` đều trống) → hỏi user: điền phiếu hay trả lời theo Bước 2 nhánh B |
| User truyền đường dẫn một phiếu YAML khác | Đọc phiếu đó thay cho `test_plan.config.yaml` |
| User chỉ nói tên mốc, phiếu chính đang là mốc khác | Tìm bản lưu `docs/test-plans/test_plan_<slug>.input.yaml`. Không có → hỏi user có muốn điền phiếu cho mốc này không; **không** tự dùng phiếu của mốc khác |
| User nói tên mốc **khác** `Mã mốc` trong phiếu chính | Báo lệch, hỏi user dùng cái nào — không tự chọn |
| `docs/test-plans/test_plan_<slug>.md` **chưa có** | Lập mới |
| `docs/test-plans/test_plan_<slug>.md` **đã có** | **KHÔNG** viết lại — sang mục [Cập nhật plan giữa đợt](#cập-nhật-plan-giữa-đợt) |

Slug: chữ thường, không dấu, nối bằng `_` — `release_2.0` · `sprint_12` · `uat_dot_2`. Cùng slug là **hợp đồng nối** giữa ba tài liệu:

```
docs/test-plans/test_plan_<slug>.md                  ← plan (workflow này)
docs/test-plans/test_plan_<slug>.input.yaml          ← phiếu đầu vào
docs/executions/test_progress_<slug>_<YYYYMMDD>.md   ← báo cáo tiến độ từng kỳ (/generate-test-progress-report)
docs/executions/test_summary_<slug>_<timestamp>.md   ← báo cáo tổng hợp (/generate-test-summary-report)
```

---

## Bước 1: Tự đọc repo trước khi đọc phiếu

> 📂 **Repo có hai kiểu thư mục cùng tồn tại** — tầng nền tảng mới `<module>/<nền-tảng>/` và kiểu cũ `<module>/`. Mọi lượt đọc `docs/testcases/` · `docs/executions/` · `docs/bugs/` phải quét **cả hai**, nếu không plan sẽ báo 0 bug / 0 lần chạy cho module làm theo kiểu cũ.

| Đọc gì | Lấy ra | Dùng cho mục |
|---|---|---|
| `docs/requirements/README.md` — **bảng thuộc tính đầu file** | Tên hệ thống · **Môi trường dùng chung** · **Vai trò & tài khoản** · **Năng lực kiểm thử của QA** | 2.3 · 3.2 · 4.1 · 5.1 · 5.2 |
| `docs/requirements/README.md` — danh mục · Vùng chưa cấp prefix · Trạng thái REQ | Module · prefix · trạng thái recon · số REQ · **AMB 🔴 treo** · REQ ⚪ ra ngoài phạm vi (kèm **lý do**) | 1.2 · 2.1 · 2.2 · 4.1 · 8.1 |
| `docs/requirements/_*/README.md` (namespace) | Danh mục riêng từng hệ thống | 2.1 |
| `docs/requirements/_discovery/system_map.md` (+ `api_map.md`) | Nền tảng từng module · phụ thuộc · **Vùng chưa xác minh** · **Vùng loại khỏi phạm vi** · module bị chặn | 2.1 · 2.2 · 3.2 · 8.1 |
| `docs/requirements/<module>/…` — metadata · mục `RISK-<MODULE>-xx` · Nhật ký thay đổi | `Trình duyệt khảo sát` / `Thiết bị khảo sát` / `Nguồn spec` · **rủi ro sản phẩm đã ghi** · tên + phiên bản tài liệu làm cơ sở | 1.2 · 5.1 · 8.2 |
| `docs/testcases/README.md` | Module đã có TC · số TC theo nền tảng · REQ bao phủ | 2.1 |
| `docs/testcases/<module>/TEST_CASES_<TÊN_MODULE>_SUMMARY.md` → file nền tảng (kiểu cũ: chính index) | ⭐ **Bảng ISO/IEC 25010** — ô `➖` kèm người chịu · **Bảng 4 vòng** · kỹ thuật đã dùng · bộ chạy đề xuất · TC phi chức năng đã có (tag, nhóm Non-functional) · rủi ro RBT | 2.2 · 3.2 · 3.2.1 · 3.3 · 3.5 · 3.7 · 8.2 |
| `docs/executions/<module>/<nền-tảng>/run_*/` · kiểu cũ `docs/executions/<module>/run_*/` | Module × nền tảng **đã từng chạy** | 2.1 |
| `docs/bugs/README.md` → `BUG_*.md` (cả hai kiểu thư mục) | Bug đang mở theo Severity · Priority · trạng thái đang dùng | 4.1 · 4.2 · 8.1 · 9 |
| `.claude/skills/skills-bug-reporter/SKILL.md` — *Severity & Priority Guide* · *4 trạng thái retest* | Thang Severity/Priority mặc định **nguyên văn** · kết quả retest | 9 |
| `docs/traceability/traceability_matrix.md` (nếu có — file chung: độ phủ theo module + ⬛ module ngoài RTM; cần từng REQ thì theo `## Bản đồ tài liệu` sang file module. RTM kiểu cũ ở chỗ khác vẫn đọc) | Độ phủ REQ ↔ TC ↔ Automation | 2.1 · 3.6 |
| `docs/executions/test_summary_*.md` của **mốc trước** | *Yếu tố cản trở & Bài học* · **thời lượng thực tế** đợt trước (dữ liệu cho ước lượng `tỷ lệ`/`ngoại suy`) | 4.1 · 5 · 7.2 · 8.1 · 9 |
| Project automation (`package.json` · `pom.xml` · `pyproject.toml`) · file CI (`.github/workflows/` · `.gitlab-ci.yml` · `Jenkinsfile`) | Đã có framework automation chưa · đã có pipeline chưa · số script hiện có | 3.2 · 3.7 · 5.3 · 8.1 |

> ⭐ **Mục 2.2 lấy từ repo trước, phiếu YAML bổ sung sau.** Ô `➖` của bảng 25010, *Vùng loại khỏi phạm vi* của `system_map.md` và REQ ⚪ đều là quyết định **đã được ghi lại lúc nhìn kỹ hệ thống**.
>
> ⚠️ **REQ ⚪ bị loại vì hạn chế môi trường** (VD *"không chạy trên môi trường dùng chung"*) mà phiếu khai `Dùng chung với đội khác: không` → **không** tự đưa lại vào phạm vi. Liệt kê ở 2.1 thành bảng *REQ cần quyết định lại*, theo ô `Đưa lại REQ bị loại vì môi trường`.

---

## Bước 2: Đọc phiếu đầu vào — hoặc hỏi một lượt (CHECKPOINT)

### Nhánh A — có phiếu YAML

1. **Parse** — lỗi cú pháp YAML → báo **số dòng** kèm nguyên nhân thường gặp (thụt lề bằng Tab · lệch cột trong danh sách · giá trị có `": "` hoặc `" #"` chưa đặt trong ngoặc kép), dừng. Chuẩn hoá Unicode NFC trước khi đọc
2. **Kiểm tra giá trị** — đối chiếu bảng *Cấu trúc và giá trị hợp lệ* ở mục Phiếu cấu hình (`Nền tảng`, `Mức độ`, `Kỹ thuật`, `Vai trò`, `Bộ tiêu chí ra`, các ô `có` · `không`, ngày…). Gặp tên ô không có trong bảng → báo user, không tự diễn giải. Sai giá trị → liệt kê kèm số dòng, **không** tự đoán
3. **Đối chiếu với repo** — liệt kê mâu thuẫn, **không** tự chọn bên nào:

   | Mâu thuẫn | Ví dụ |
   |---|---|
   | Module không có trong danh mục | `Phạm vi` khai `INVOICE` nhưng `docs/requirements/README.md` không có prefix này |
   | Nền tảng module không có | Khai `CUST` × `mobile` nhưng `system_map.md` chỉ ghi web |
   | Môi trường khác bản đã khảo sát | Phiếu `Dùng chung với đội khác: không`, README ghi `CÓ` → **hợp lệ**, ghi vào 2.3 là môi trường đợt này khác môi trường khảo sát, kèm rủi ro lệch tài liệu |
   | Lịch vô lý | `Bắt đầu thực thi` sớm hơn `Môi trường sẵn sàng` · `Phát hành` sớm hơn `Đóng băng mã nguồn` · `Hồi quy từ` sau `Hồi quy đến` |
   | Nhân lực không phủ phạm vi | Cặp module × nền tảng không ai phụ trách |
   | Mâu thuẫn nội bộ | `Loại kiểm thử` → `Tự động hoá: không` nhưng `Nhân lực` có người vai trò `tự động hoá` · hoặc `Chiến lược tự động hoá` có dữ liệu · `Kỹ thuật: ba điểm` mà `Chi tiết ba điểm` trống · `Phi chức năng` khai loại mà `Loại kiểm thử` ghi `không` · `Có dữ liệu thật của khách hàng: có` mà `Cách che dữ liệu` trống · `Thang riêng` có dữ liệu mà `Thang Severity`/`Thang Priority` đều `mặc định` |
   | Lệch công cụ | `Hệ thống CI` khác file CI thật trong repo · `Công cụ` → `Quản lý lỗi` không có Jira mà `Quy trình trạng thái: mặc định` vẫn nhắc đồng bộ Jira |

4. **Chỉ hỏi user** khi: thiếu `Mốc` hoặc `Phạm vi` → `Trong phạm vi` (không lập được plan) · sai cú pháp · sai giá trị · mâu thuẫn ở bước 3. Mọi ô trống khác → ghi `❓`, **không** hỏi

### Nhánh B — không có phiếu

Hỏi **một lượt**, gom theo đúng các nhóm của phiếu (bỏ câu repo đã trả lời):

| # | Nhóm | Câu hỏi |
|---|---|---|
| 1 | `Mốc` | Tên đợt · số build · hệ thống thuộc đợt |
| 2 | `Phạm vi` | Module × nền tảng trong đợt · ngoài phạm vi bổ sung (kèm ai chịu) · có đưa lại REQ ⚪ bị loại vì hạn chế môi trường không |
| 3 | `Lịch` | Duyệt kế hoạch · xong TC · môi trường sẵn sàng · bắt đầu · đóng băng mã nguồn · hồi quy · nghiệm thu · phát hành · **tần suất báo cáo tiến độ** |
| 4 | `Nhân lực` · `Cần tuyển thêm người` | QA Lead · kiểm thử viên × phạm vi · người làm tự động hoá · nhu cầu đào tạo, tuyển thêm |
| 5 | `Môi trường` · `Dữ liệu kiểm thử` · `Công cụ` | Ai dựng · có dùng chung · trình duyệt/thiết bị · dữ liệu nền lấy từ đâu, có dữ liệu thật không, che thế nào, ai dọn · công cụ quản lý lỗi/kết quả và **nguồn chính khi lệch** |
| 6 | `Cấp độ kiểm thử` · `Độc lập kiểm thử` · `Loại kiểm thử` · `Phi chức năng` | Đợt gồm cấp độ nào, ai làm · đội test độc lập tới mức nào · hồi quy · kiểm thử lại lỗi · liên module · tự động hoá · nghiệm thu (ai làm) · cách chạy mobile/API · loại phi chức năng nào, đo gì, ngưỡng bao nhiêu |
| 6b | `Chiến lược tự động hoá` | *(chỉ khi có tự động hoá)* Tự động cái gì, không tự động cái gì · chạy khi nào, trên CI nào · ai bảo trì |
| 7 | `Mục tiêu` | Mục tiêu đo được của đợt — hoặc để agent đề xuất |
| 8 | `Ước lượng` · `Ngân sách` | Kỹ thuật ước lượng + con số · có ngân sách riêng không |
| 8b | `Quản lý lỗi` | Dùng quy trình trạng thái và thang Severity/Priority mặc định không · ai phân loại lỗi, họp bao lâu một lần · thời hạn phản hồi/sửa theo Severity |
| 9 | `Tiêu chí` | Bộ tiêu chí ra mặc định hay riêng/bổ sung · ai được chấp nhận dừng khi hết thời gian · ngưỡng tạm dừng |
| 10 | `Kiểm soát tài liệu` · `Bên liên quan` · `Mẫu tài liệu` · `Phê duyệt` · `Chuẩn tổ chức` | Ai lập, ai review · mức phân loại tài liệu · ai nhận gì, tần suất, kênh · mẫu riêng · ai duyệt · mẫu của khách · có Test Policy/Test Strategy tổ chức |

Nhận câu trả lời → **ghi vào `plans/master-test-plan/test_plan.config.yaml`** — điền tại chỗ trên khung phiếu, giữ nguyên chú thích — rồi đi tiếp như Nhánh A. Lần cập nhật sau có phiếu để sửa, không phải hỏi lại từ đầu.

> ### ⚠️ Mục "Ngoài phạm vi" là mục có giá trị pháp lý cao nhất trong plan
>
> Khi có sự cố production, câu hỏi đầu tiên luôn là *"sao QA không test cái này?"*. Plan ghi rõ *"hiệu năng và bảo mật không thuộc phạm vi đợt này"* thì đó là **quyết định đã được thống nhất từ trước**, không phải QA bỏ sót. Module có **nền tảng mobile/API mà đợt này không kiểm** phải ghi ở 2.2, không được im lặng chỉ khai phần web.

---

## Bước 3: Tính toán từ dữ liệu đã có

| Mục | Tính gì | Quy tắc |
|---|---|---|
| 7.2 | `ba điểm`: E = (a + 4m + b) / 6 · SD = (b − a) / 6 cho từng hạng mục · **E tổng** = cộng E · **SD tổng** = cộng SD các hạng mục (cách cộng thận trọng — ghi rõ trong plan) | Làm tròn 1 chữ số thập phân · ghi công thức trong plan để người duyệt tính lại được |
| 7.2 | `tỷ lệ` / `ngoại suy` | Chỉ tính khi có số thật: tỷ lệ của tổ chức, hoặc thời lượng thực tế trong `test_summary_*` / `test_progress_*` mốc trước. Không có → `❓`, **không** tự đặt tỷ lệ |
| 7.2 | Đối chiếu công sức với nhân lực × số ngày làm việc giữa `Bắt đầu thực thi` và `Đóng băng mã nguồn` | Thiếu công sức → đưa thành rủi ro ở 8.1, **không** tự sửa con số |
| 7.1 | Thứ trong tuần của các mốc | Mốc rơi vào cuối tuần → ghi chú, cân nhắc rủi ro |
| 4.1 | Trạng thái từng tiêu chí vào **tại ngày lập** | Lấy từ repo; điều kiện tương lai → `❓` kèm ngày dự kiến |
| 9 | Bug đang mở theo Severity × Priority tại ngày lập | Đếm từ `docs/bugs/` — cả hai kiểu thư mục |
| 3.7 | Kích hoạt chạy khớp lịch 7.1 | Bộ `trước phát hành` phải chạy **trước** ngày `Hồi quy đến`; bộ gắn build phải có môi trường sẵn sàng. Lệch → rủi ro 8.1 |

---

## Bước 4: Xuất Master Test Plan

> 📖 Nội dung đầy đủ ở [`references/plan_template.md`](references/plan_template.md) — **đọc khi:** **Bước 4 — trước khi ghi plan**.

---

## Bàn giao

**Checklist:**

- [ ] Plan ở `docs/test-plans/test_plan_<slug>.md`, **bản lưu phiếu** ở `docs/test-plans/test_plan_<slug>.input.yaml` — cùng slug, chép nguyên `test_plan.config.yaml` đã dùng, còn đủ chú thích
- [ ] Phiếu **không** chứa URL có token, mật khẩu, API key
- [ ] Mọi dòng của bảng *Nội dung điển hình theo ISTQB CTFL v4.0 — 5.1.1* đều có mục tương ứng **có nội dung** (hoặc `❓` nằm trong danh sách ô treo)
- [ ] 1.1 mỗi mục tiêu có cột **Đo bằng**
- [ ] 1.2 liệt kê tài liệu cơ sở **kèm phiên bản/ngày**
- [ ] 2.1 khai theo **module × nền tảng**, số liệu lấy từ danh mục
- [ ] 2.2 không trống; mỗi dòng có **người chịu trách nhiệm** và **nguồn quyết định**; đủ ô `➖` bảng 25010 · *Vùng loại khỏi phạm vi* · REQ ⚪
- [ ] REQ ⚪ bị loại vì hạn chế môi trường cũ **không** bị tự đưa lại — nằm ở bảng *REQ cần quyết định lại*
- [ ] Đã quét **cả** tầng nền tảng lẫn kiểu cũ ở `testcases/` · `executions/` · `bugs/`
- [ ] 3.1 mọi cấp độ có cột *Tiêu chí vào/ra* — không để trống
- [ ] 3.4 mức độc lập đã ghi — hoặc `❓` trong danh sách treo
- [ ] 3.2.1 đủ **6 loại** phi chức năng; loại `có` có ngưỡng đo được hoặc `❓` — không số bịa
- [ ] 3.7 có hiện trạng đọc từ repo · phạm vi tự động/không tự động · kích hoạt chạy — hoặc ghi `Không áp dụng`
- [ ] Tiêu chí exit mặc định **khớp nguyên văn** `skills-test-summary-reporter`; tiêu chí dự án thêm nằm ở **bảng bổ sung**, không chen vào bảng mặc định
- [ ] 4.2 có ghi chú *dừng khi hết thời gian/ngân sách* kèm **người có quyền chấp nhận**
- [ ] 5 tách **5.1 Môi trường · 5.2 Dữ liệu kiểm thử · 5.3 Công cụ**; 5.2 nêu rõ có dữ liệu thật của khách hàng không
- [ ] 9.2 · 9.3 thang mặc định **khớp nguyên văn** `skills-bug-reporter`; 9.4 thời hạn xử lý không có số bịa; số bug đang mở đếm từ `docs/bugs/`
- [ ] 7.2 có kỹ thuật ước lượng + giả định; three-point có công thức; đã đối chiếu với năng lực nhân lực
- [ ] 7.3 đã điền hoặc ghi rõ *không có ngân sách riêng*
- [ ] 8.1 rủi ro dự án tách bạch 8.2 rủi ro sản phẩm; 8.2 có link về tài liệu nguồn
- [ ] Mọi ô không suy ra được là `❓`, **không có số bịa**; danh sách ô treo nằm **đầu** tài liệu
- [ ] Đầu tài liệu có mục **Kiểm soát tài liệu**: trạng thái đúng 1 trong 4 giá trị · người lập · người review · người phê duyệt · mức phân loại
- [ ] 12.1 đủ dòng cho mọi mục và mục con; cột IEEE 829 ghi **829-1998**; ghi rõ 3.7 và 9 là phần mở rộng
- [ ] 12.2 đã điền hoặc ghi `Không áp dụng` — nhắc cả **Test Policy** lẫn **Test Strategy**
- [ ] **Không** có số điều khoản 29119-3/829; **không** câu "tuân thủ ISO/IEC/IEEE 29119" hay "đạt chuẩn ISTQB"

**Báo cáo cho user:** số cặp module × nền tảng · số ô treo (liệt kê) · mâu thuẫn giữa phiếu và repo (nếu có) · công sức ước lượng so với năng lực · rủi ro dự án đáng chú ý nhất · đường dẫn plan + phiếu · nhắc gửi duyệt trước khi thực thi.

---

## Cập nhật plan giữa đợt

Phạm vi/lịch/nhân lực đổi → **sửa `test_plan.config.yaml` rồi chạy lại workflow**, không viết plan lại từ đầu. Plan là tài liệu được duyệt — viết đè làm mất dấu vết thứ đã thống nhất.

1. So **dữ liệu** phiếu mới với bản lưu `test_plan_<slug>.input.yaml` (bỏ qua chú thích) và plan hiện có → liệt kê **đúng các mục đổi**, cho user xác nhận
2. Sửa đúng các mục đó trong `test_plan_<slug>.md`, giữ nguyên tên file
3. Tăng phiên bản: đổi nội dung (phạm vi · lịch · nhân lực) → tăng số phụ `v1.0 → v1.1`; đổi phạm vi lớn hoặc đổi bộ tiêu chí exit → tăng số chính `v2.0`
4. Thêm dòng vào **Lịch sử thay đổi**: mục nào · đổi gì · ai sửa
5. Trạng thái về `🟨 Draft`, thêm dòng mới ở bảng **Phê duyệt** (mục 11) — bản duyệt cũ **không** tự áp cho bản mới
6. ⚠️ **Đổi tiêu chí exit sau khi đã thực thi** → ghi rõ lý do và thời điểm. Báo cáo tổng hợp sẽ nêu việc này — đổi ngưỡng sau khi đã thấy số là đúng thứ `skills-test-summary-reporter` cấm
