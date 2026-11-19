## Bước 4: Xuất Master Test Plan

**Trước khi ghi plan:** chép nguyên file phiếu đã dùng (kể cả chú thích) thành `docs/test-plans/test_plan_<slug>.input.yaml` (ghi đè bản lưu cũ của cùng slug — lịch sử nằm ở git và Lịch sử thay đổi của plan).

File: `docs/test-plans/test_plan_<slug>.md` — thư mục **`docs/test-plans/`** (tạo nếu chưa có), cắt ngang mọi module và nền tảng. Plan là tài liệu lập **trước** đợt nên **không** đặt trong `docs/executions/` — nơi chứa kết quả thực thi. **Một mốc một plan**, kể cả khi đợt gồm nhiều hệ thống — phân biệt bằng cột *Hệ thống* ở 2.1.

```markdown
# Master Test Plan — <Dự án> · <Mốc>

## Kiểm soát tài liệu

### Thông tin tài liệu

| | |
|---|---|
| Mã tài liệu | `test_plan_<slug>` |
| Phiên bản tài liệu | v1.0 |
| Trạng thái | 🟨 Draft — còn <N> ô chờ thông tin |
| Mức phân loại | <công khai · nội bộ · mật> |
| Ngày lập | <DD-MM-YYYY> |
| Ngày hiệu lực | <ngày bản được duyệt — trống khi chưa duyệt> |
| Người lập | <theo phiếu `Kiểm soát tài liệu` → `Người lập`> |
| Người review | <theo phiếu `Người review` — tên · vai trò> |
| Người phê duyệt | <theo phiếu `Phê duyệt`> — chữ ký ở mục 11 |
| Hệ thống · Build | <hệ thống> · <build hoặc ❓> |
| Phiếu đầu vào | `docs/test-plans/test_plan_<slug>.input.yaml` (bản lưu của `test_plan.config.yaml`) |
| Cấu trúc tài liệu | Biên soạn **theo cấu trúc** ISO/IEC/IEEE 29119-3 — Test Plan · phủ đủ nội dung điển hình của ISTQB CTFL v4.0 mục 5.1.1 · ánh xạ ở mục 12 |

> **Trạng thái hợp lệ:** 🟨 Draft (đang soạn / còn ô treo) → 🟦 Chờ duyệt (đã review, không còn ô treo chặn) → 🟩 Đã duyệt (đủ chữ ký mục 11) → ⬛ Hết hiệu lực (có bản mới thay thế). Sửa nội dung bản 🟩 → quay về 🟨, tăng phiên bản.

> **Ô còn treo (<N>):** <mỗi ô một dòng `- **N.** nội dung (mục)` — dùng gạch đầu dòng, **không** dùng danh sách đánh số của markdown vì trình hiển thị tự đánh lại số khi gom nhóm · ghi ai cần trả lời · **gom theo người trả lời** khi > 8 ô> · đối chiếu tên mục 29119-3 ở mục 12.1 (khi đem đi audit)

### Lịch sử thay đổi

| Phiên bản | Ngày | Người sửa | Mục thay đổi | Nội dung | Người duyệt |
|---|---|---|---|---|---|
| v1.0 | <ngày> | <QA Lead> | Toàn bộ | Lập mới | ❓ |

---

## 1. Mục tiêu & Cơ sở kiểm thử

### 1.1 Mục tiêu kiểm thử

| # | Mục tiêu | Đo bằng |
|---|---|---|
| O1 | Xác nhận luồng <nghiệp vụ> hoạt động đúng đặc tả trên <nền tảng> | Tiêu chí exit #3, #4 |
| O2 | Không còn lỗi Critical ở <vùng> trước release | Tiêu chí exit #1 |

> Mục tiêu nào không đo được bằng tiêu chí exit hay chỉ số ở 3.6 → viết lại, hoặc bỏ. Phiếu để trống → agent đề xuất, đánh dấu *chờ duyệt*.

### 1.2 Cơ sở kiểm thử (Test basis)

| Tài liệu | Phiên bản / ngày cập nhật | Module | Ghi chú |
|---|---|---|---|
| `docs/requirements/<module>/REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` | Nhật ký thay đổi <ngày> | <module> | <N> REQ · <N> AMB 🔴 treo |
| Spec API `openapi_<ngày>.json` | `info.version` <x> | <module> | |

> Cơ sở kiểm thử **đổi giữa đợt** (ticket sửa yêu cầu) → cập nhật bằng `/update-requirements-from-ticket` rồi tăng phiên bản plan — TC viết theo cơ sở cũ là TC sai.

## 2. Phạm vi

### 2.1 Trong phạm vi

> Mỗi dòng là **một module × một nền tảng** — đơn vị báo cáo tiến độ theo dõi và báo cáo tổng hợp chấm tiêu chí exit #7.

| Module | Prefix | Nền tảng | Số REQ | Số TC hiện có | Đã từng chạy? | Ghi chú |
|---|---|---|---|---|---|---|

**REQ cần quyết định lại** *(chỉ khi có REQ ⚪ bị loại vì hạn chế môi trường cũ)*:

| REQ | Nội dung | Lý do bị loại trước đây | Quyết định theo phiếu |
|---|---|---|---|

### 2.2 NGOÀI phạm vi (out of scope)

| Không kiểm thử | Lý do | Ai chịu trách nhiệm | Nguồn quyết định |
|---|---|---|---|

> Mục này đã được thống nhất với <người duyệt> ngày <ngày>. Thay đổi phạm vi phải cập nhật tài liệu, tăng phiên bản và thông báo lại.

### 2.3 Giả định & Ràng buộc

| Loại | Nội dung | Ảnh hưởng tới kiểm thử | Nguồn |
|---|---|---|---|

### 2.4 Các bên liên quan & Giao tiếp

| Bên | Vai trò trong đợt | Liên quan tới kiểm thử | Nhận gì | Tần suất | Kênh |
|---|---|---|---|---|---|

**Mẫu tài liệu dùng trong đợt:**

| Tài liệu | Mẫu | Workflow sinh |
|---|---|---|
| Test case | Mẫu của `skills-rbt-manual-testing` | `/generate-testcases-manual-rbt` |
| Execution report | Mẫu của `skills-manual-test-executor` | `/execute-test-cases` |
| Bug report | Mẫu của `skills-bug-reporter` | `/create-bug-report` |
| Báo cáo tiến độ | Mẫu của `skills-test-progress-reporter` | `/generate-test-progress-report` |
| Báo cáo tổng hợp | Mẫu của `skills-test-summary-reporter` | `/generate-test-summary-report` |

> Phiếu `Mẫu tài liệu` → `Mẫu riêng` có dữ liệu → thay dòng tương ứng bằng đường dẫn mẫu của khách/công ty.

## 3. Chiến lược kiểm thử (Test approach)

### 3.1 Cấp độ kiểm thử

| Cấp độ | Trong đợt? | Ai thực hiện | Tiêu chí vào/ra |
|---|---|---|---|
| Component (unit) | ❌ ngoài phạm vi QA | Đội Dev | Theo quy trình Dev |
| Component integration | ❌ | Đội Dev | Theo quy trình Dev |
| System | ✅ | QA | Bộ chung mục 4 |
| System integration | ✅ | QA | Bộ chung mục 4 |
| Acceptance (UAT) | ✅ | <bên thực hiện> | Tiêu chí riêng: <…> hoặc "bộ chung" |

> ISTQB v4 khuyến nghị tiêu chí vào/ra **theo từng cấp độ**. Cấp độ dùng bộ chung thì ghi "Bộ chung mục 4" — **không** để trống cột.

### 3.2 Loại kiểm thử

| Loại test | Nền tảng | Có làm? | Cách làm | Ghi chú |
|---|---|---|---|---|
| Kiểm thử chức năng | Web | ✅ | Manual theo TC — `/execute-test-cases` | |
| Kiểm thử chức năng | Mobile | <theo phiếu> | Automation `/generate-automation-mobile` hoặc tester tự chạy | Repo chưa có workflow chạy tay mobile |
| Kiểm thử chức năng | API | <theo phiếu> | Automation `/generate-automation-api` | |
| Regression | | | | |
| Retest bug | | ✅ | `/retest-fixed-bugs` | Critical/Major chạy mode FULL |
| Tích hợp cross-module | | | `/generate-cross-module-test-plan` | |
| Automation | | | `/generate-automation-framework` → `/generate-automation-web` | |
| Vòng 3 — kỹ thuật | | Theo *Năng lực kiểm thử của QA* | Nhánh ❌ → đội Dev xác minh | Không phải vùng trắng |
| Hiệu năng · Bảo mật chuyên sâu | | | | |

**Tỷ trọng manual/automation:** <theo phiếu> — chi tiết ở 3.7. **Thứ tự ưu tiên thực thi:** theo rủi ro sản phẩm (8.2) — cặp module × nền tảng nào là cổng vào của các module khác chạy trước.

#### 3.2.1 Kiểm thử phi chức năng

> Đủ **6 dòng** — kể cả loại không làm (ghi `❌`, trỏ sang 2.2). Loại `có` phải có **ngưỡng đo được**; ngưỡng trống → `❓`, **không** tự đặt con số. Cột *TC đã có* đọc từ tài liệu test case (nhóm Non-functional · bảng ISO/IEC 25010) — vài TC lẻ đã có **không** tự biến loại đó thành `có`.

| Loại | Có làm? | Mục tiêu đo | Ngưỡng chấp nhận | Cách làm · công cụ | Môi trường | Ai thực hiện | TC đã có |
|---|---|---|---|---|---|---|---|
| Hiệu năng | | | | | | | |
| Bảo mật | | | | | | | |
| Tương thích | | | | | | | |
| Khả năng truy cập | | | | | | | |
| Khả dụng | | | | | | | |
| Độ tin cậy & phục hồi | | | | | | | |

> Ngưỡng của loại `có` là ứng viên cho **bảng tiêu chí ra bổ sung** (4.2) — gợi ý cho người duyệt, **không** tự thêm.

### 3.3 Kỹ thuật thiết kế test

> Chỉ liệt kê kỹ thuật **bộ TC trong phạm vi thực sự đã dùng** — đọc từ tài liệu test case. Module chưa có TC → ghi "xác định khi sinh TC".

| Kỹ thuật | Áp dụng ở đâu |
|---|---|

### 3.4 Mức độc lập của kiểm thử

| | |
|---|---|
| Mức độ | <tác giả tự test · đồng nghiệp cùng đội · đội QA riêng trong tổ chức · bên ngoài tổ chức> |
| Thể hiện ở đâu | <VD: QA thuộc phòng Chất lượng, không báo cáo cho trưởng nhóm Dev · review TC chéo giữa tester> |
| Giới hạn | <VD: UAT do khách thực hiện — độc lập cao nhất nhưng không kiểm kỹ thuật> |

### 3.5 Retest & Regression

- Bug đã fix → `/retest-fixed-bugs`: Critical/Major chạy **mode FULL**, Minor/Trivial chạy mode RETEST
- Mỗi build mới → chạy bộ Smoke trước khi thực thi tiếp
- Regression trước release → <bộ regression / automation suite>

### 3.6 Chỉ số theo dõi

> Nhóm theo ISTQB CTFL v4.0 mục 5.3.1. `/generate-test-progress-report` báo cáo **đúng các chỉ số này** mỗi kỳ.

| Nhóm | Chỉ số | Nguồn | Dùng để |
|---|---|---|---|
| Tiến độ kiểm thử | TC đã viết / đã review · TC đã chạy / chưa chạy · PASS · FAIL · BLOCKED | `docs/testcases/` · `execution_report.md` | Báo cáo tiến độ · tiêu chí exit #3, #4, #5, #7 |
| Tiến độ dự án | Công sức thực tế so với ước lượng 7.2 | Báo cáo tiến độ | Phát hiện trễ sớm |
| Lỗi | Bug mới / đã fix / đang mở theo Severity · regression phát sinh | `docs/bugs/` · công cụ quản lý bug | Tiêu chí exit #1, #2 |
| Độ phủ | REQ có TC · REQ Critical có TC PASS | `docs/traceability/traceability_matrix.md` (số tổng) + file module (cột `Kết quả gần nhất`) | Tiêu chí exit #6 |
| Rủi ro | Trạng thái từng rủi ro ở 8.1 | Báo cáo tiến độ | Kiểm soát rủi ro |

### 3.7 Chiến lược tự động hoá

> Phiếu `Loại kiểm thử` → `Tự động hoá: không` → cả mục ghi `Không áp dụng — đợt này không tự động hoá`, **đừng** xoá mục.

| | |
|---|---|
| Mục tiêu | <VD: rút thời gian regression · chạy Smoke sau mỗi build> |
| Hiện trạng | <đã có project automation chưa · số script · đã có pipeline chưa — **đọc từ repo**> |
| Tầng kiểm thử (kim tự tháp) | <tỷ trọng unit (Dev) / API / UI> — ISTQB CTFL v4.0 mục 5.1.6: càng lên tầng UI, test càng ít, chậm và dễ vỡ |
| Tiêu chí chọn TC để tự động | <VD: Priority High · chạy lặp mỗi build · kết quả ổn định · không cần mắt người đánh giá> |
| Framework · report | <theo phiếu `Công cụ` → `Tự động hoá`> · output trong `reports/` |
| Hệ thống CI | <theo phiếu> |
| Người bảo trì | <theo phiếu> |

**Phạm vi:**

| Tự động | Không tự động | Lý do không tự động |
|---|---|---|

**Kích hoạt chạy:**

| Bộ chạy | Khi nào | Môi trường | Ai xem kết quả | Fail thì |
|---|---|---|---|---|
| Smoke | <mỗi build lên môi trường test> | | | Chặn thực thi manual — tiêu chí tạm dừng 4.3 |
| Regression | <trước phát hành> | | | Phân loại bằng `/run-and-fix-tests` — **không** sửa test để né bug |

**Nguyên tắc:**
- Script chỉ tính là xong khi đạt Definition of Done của `CLAUDE.md` — PASS ổn định ≥ 2 lần liên tiếp, đủ Allure metadata và screenshot
- Kết quả automation **báo riêng**, không cộng vào pass rate manual của tiêu chí exit #3, #4
- Test chập chờn → `/analyze-flaky-tests`, **không** chạy lại tới khi xanh · UI đổi → `/heal-locators` · yêu cầu đổi → `/update-automation-from-impact`

## 4. Tiêu chí Vào / Ra

### 4.1 Tiêu chí VÀO (Entry) — chưa đủ thì CHƯA bắt đầu test

> Nhóm theo ISTQB CTFL v4.0 mục 5.1.3: nguồn lực · testware · chất lượng ban đầu của đối tượng kiểm thử. Trạng thái tại ngày lập plan.

| # | Nhóm | Điều kiện | Trạng thái |
|---|---|---|---|
| 1 | Nguồn lực | Nhân lực ở mục 6 đã được phân công, đủ người cho mọi cặp module × nền tảng | |
| 2 | Nguồn lực | Môi trường test sẵn sàng, có dữ liệu nền | |
| 3 | Nguồn lực | Tài khoản test đủ mọi vai trò trong phạm vi | |
| 4 | Nguồn lực | Công cụ sẵn sàng: quản lý bug · quản lý kết quả · automation | |
| 5 | Nguồn lực | Ngân sách đã duyệt *(khi có ngân sách riêng)* | |
| 6 | Testware | Tài liệu requirements của mọi module × nền tảng trong phạm vi đã có | |
| 7 | Testware | AMB 🔴 đã được giải đáp hoặc người duyệt chấp nhận treo | |
| 8 | Testware | Test case đã viết và đã review — đủ từng nền tảng | |
| 9 | Chất lượng ban đầu | Build đã deploy và truy cập được | |
| 10 | Chất lượng ban đầu | Smoke test đã pass | |
| 11 | Chất lượng ban đầu | *(có mobile)* Bản build app cài được trên thiết bị · app Flutter đã bật semantics | |
| 12 | Chất lượng ban đầu | *(có API)* Snapshot spec khớp build đang test · có quyền gọi thử | |

> ⚠️ Bắt đầu test khi chưa đạt tiêu chí vào là nguyên nhân số một khiến kết quả kiểm thử không dùng được — BLOCKED tràn lan, phải chạy lại từ đầu.

### 4.2 Tiêu chí RA (Exit)

> Bảng mặc định lấy **nguyên văn** từ `skills-test-summary-reporter`. `/generate-test-summary-report` chấm lại **cả bảng mặc định lẫn bảng bổ sung**.

| # | Tiêu chí | Ngưỡng |
|---|---|---|
| 1 | Bug **Critical** đang mở | **0** |
| 2 | Bug **Major** đang mở | 0, hoặc có workaround được PM chấp nhận bằng văn bản |
| 3 | Pass rate TC **Priority High** | **≥ 95%** |
| 4 | Pass rate toàn bộ TC đã chạy | ≥ 90% |
| 5 | Tỷ lệ **BLOCKED** | ≤ 5% |
| 6 | REQ mức Critical có ít nhất 1 TC **PASS** | 100% |
| 7 | Module trong phạm vi release đã có TC và đã chạy — tính trên **từng cặp module × nền tảng** trong phạm vi | 100% |

**Tiêu chí bổ sung của dự án** *(chỉ khi phiếu `Tiêu chí ra bổ sung` có dữ liệu — đánh số tiếp từ #8)*:

| # | Tiêu chí | Ngưỡng |
|---|---|---|

> Gợi ý ISTQB CTFL v4.0 mục 5.1.3 cho bảng bổ sung: mật độ lỗi · đã thực hiện kiểm thử tĩnh (review requirements/TC) · mọi lỗi tìm thấy đã được báo cáo · toàn bộ regression đã được automate.

> **Kết quả checklist (`/generate-checklist-test`) được tính thế nào** — ghi nguyên đoạn này vào plan để người duyệt biết trước: #3 · #4 · #5 · #7 chỉ tính trên **bộ TC**; #6 nhận mục checklist PASS **chỉ** cho REQ chưa có TC nào; cặp module × nền tảng chỉ có checklist là #7 **chưa đạt**. Đợt muốn dùng checklist làm điều kiện ra (smoke, release-readiness) → thêm vào bảng bổ sung, VD *"Checklist release-readiness: 100% mục P1 PASS"*. Luật đầy đủ: `skills-test-summary-reporter` mục *Kết quả checklist trong các tiêu chí*.

☐ Bộ mặc định  ☐ Bộ mặc định + bổ sung  ☐ Bộ tiêu chí riêng của dự án

> ⚠️ **Dừng kiểm thử khi hết thời gian hoặc ngân sách** (ISTQB CTFL v4.0 mục 5.1.3): được coi là hợp lệ **chỉ khi** <người có quyền theo phiếu> đã xem xét và **chấp nhận bằng văn bản** rủi ro phát hành mà chưa đạt đủ tiêu chí. Báo cáo tổng hợp khi đó ghi rõ tiêu chí nào chưa đạt và ai chấp nhận — **không** chấm lại thành "Đạt".

### 4.3 Tiêu chí TẠM DỪNG (Suspension) & tiếp tục

**Tạm dừng kiểm thử khi:** môi trường sập > 4 giờ · build lỗi không đăng nhập được · > 30% TC BLOCKED cùng một nguyên nhân · phát hiện bug Critical chặn luồng chính · *(mobile)* bản build không cài/không mở được.

**Tiếp tục khi:** nguyên nhân đã xử lý, có build mới, và đã chạy lại smoke.

> Ngưỡng trên là **đề xuất của agent** — ghi *đã xác nhận* khi phiếu `Dùng ngưỡng tạm dừng đề xuất: có`, ngược lại dùng danh sách riêng.

## 5. Môi trường, Dữ liệu & Công cụ

### 5.1 Môi trường kiểm thử

| | |
|---|---|
| Môi trường | <tên> — URL lưu ở `.env`, **không** ghi vào tài liệu này |
| Dùng chung với đội khác? | <Có/Không> — <hệ quả với TC phá huỷ> |
| Khác môi trường đã khảo sát? | <Có → nêu khác gì, rủi ro lệch tài liệu ở 8.1> |
| Web — trình duyệt | <từ `Trình duyệt khảo sát` hoặc phiếu> |
| Mobile — thiết bị | <máy · OS · bản app · loại app> |
| API — nguồn spec | <`Nguồn spec` · `Môi trường gọi thử`> — **không** ghi base URL có token |
| Người dựng · ngày sẵn sàng | <ai> · <ngày> |

> Chỉ giữ dòng của nền tảng có trong phạm vi.

### 5.2 Quản lý dữ liệu kiểm thử

| | |
|---|---|
| Dữ liệu nền | <mô tả dữ liệu nạp sẵn — số bản ghi, trạng thái nghiệp vụ> |
| Nguồn dữ liệu | <tự sinh khi chạy · nạp sẵn · bản sao production đã che · nhập tay> |
| Tài khoản test | <đủ vai trò nào — **chỉ** tên vai trò, mật khẩu ở `.env`> |
| Dữ liệu thật của khách hàng | <Không · Có → cách che: …> |
| Quy tắc sinh dữ liệu | Random + traceable theo `CLAUDE.md` mục 7 — nhìn bản ghi biết test nào tạo |
| Dọn dữ liệu sau khi chạy | <Có/Không> — <ai dọn · khi nào> |
| Làm mới dữ liệu nền | <VD: trước mỗi vòng regression> |
| Người cung cấp | <ai> |

> 🔒 Dữ liệu thật của khách hàng lọt vào evidence (ảnh chụp, bug report) là rủi ro lộ dữ liệu — `Có dữ liệu thật: có` mà chưa có cách che → thêm rủi ro ở 8.1.

### 5.3 Công cụ

| Mục đích | Công cụ | Ghi chú |
|---|---|---|
| Quản lý lỗi | | **Nguồn chính khi lệch:** <…> |
| Quản lý kết quả kiểm thử | | |
| Tự động hoá | <framework · ngôn ngữ · report> | Chi tiết ở 3.7 |
| CI | | |
| Khác | | |

## 6. Nhân lực & Phân công

| Vai trò | Người | Module × nền tảng phụ trách | Ghi chú |
|---|---|---|---|

**Nhu cầu đào tạo:** <…> · **Nhu cầu tuyển thêm:** <…>

## 7. Lịch trình, Ước lượng & Ngân sách

### 7.1 Lịch trình & Mốc

| Mốc | Ngày | Điều kiện hoàn thành |
|---|---|---|
| Duyệt plan | | Mục 11 có chữ ký |
| Hoàn tất viết & review TC | | Đủ từng nền tảng |
| Môi trường sẵn sàng | | Tiêu chí vào #2, #3 |
| Bắt đầu thực thi | | Đạt toàn bộ tiêu chí vào 4.1 |
| Báo cáo tiến độ | <tần suất · ngày trong tuần> | `/generate-test-progress-report` — slug `<slug>` |
| Code freeze | | |
| Regression | | |
| UAT | | |
| Báo cáo tổng hợp | | `/generate-test-summary-report` — slug `<slug>` |
| Release | | |

### 7.2 Ước lượng công sức

| | |
|---|---|
| Kỹ thuật (ISTQB CTFL v4.0 mục 5.1.4) | <Estimation based on ratios · Extrapolation · Wideband Delphi / Planning Poker · Three-point estimation> |
| Giả định của ước lượng | <…> |

| Hạng mục | a (lạc quan) | m (khả năng nhất) | b (bi quan) | E = (a+4m+b)/6 | SD = (b−a)/6 |
|---|---|---|---|---|---|
| **Tổng** | | | | **<E> người-ngày** | **±<SD>** |

**Đối chiếu năng lực:** <số người> × <số ngày làm việc từ bắt đầu thực thi tới code freeze> = <năng lực> người-ngày → <đủ / thiếu X người-ngày>.

> Ước lượng luôn có sai số và dựa trên giả định — ghi rõ giả định để người duyệt đánh giá được. Không dùng three-point → bỏ bảng a/m/b, ghi con số và nguồn dữ liệu (tỷ lệ của tổ chức, số liệu đợt trước).

### 7.3 Ngân sách

| Hạng mục | Số tiền | Ghi chú |
|---|---|---|
| **Tổng** | | |

> Không có ngân sách riêng cho kiểm thử → ghi `Không có ngân sách riêng — chi phí nằm trong ngân sách dự án`. **Đừng để trống** — trống nghĩa là chưa ai xem xét.

## 8. Rủi ro

### 8.1 Rủi ro DỰ ÁN & biện pháp

> Rủi ro **của việc kiểm thử** — nhóm theo ISTQB CTFL v4.0 mục 5.2.2: tổ chức · con người · kỹ thuật · nhà cung cấp. Khả năng / Ảnh hưởng là **đề xuất của agent** — người duyệt xác nhận. `/generate-test-progress-report` theo dõi trạng thái từng dòng.

| # | Nhóm | Rủi ro | Khả năng | Ảnh hưởng | Biện pháp | Nguồn phát hiện |
|---|---|---|---|---|---|---|

### 8.2 Rủi ro SẢN PHẨM — tóm tắt

> **Nguồn chính** vẫn là tài liệu requirements (`RISK-<MODULE>-xx`) và tài liệu test case (đánh giá RBT) của từng module — bảng này chỉ **tóm tắt 3–5 rủi ro cao nhất mỗi module** để người duyệt plan thấy ngay, kèm link. Sửa rủi ro ở tài liệu nguồn, **không** sửa ở đây.

| Module | Rủi ro | Mức | Kiểm soát bằng | Nguồn |
|---|---|---|---|---|

## 9. Quản lý lỗi

> Nội dung theo ISTQB CTFL v4.0 mục 5.5. Mục này là **phần mở rộng** so với khung 29119-3 — xem 12.1.

### 9.1 Quy trình trạng thái lỗi

```text
TC FAIL ──/create-bug-report──→ 🔴 Đang mở ──Dev sửa──→ 🟡 Đã fix — chờ retest
                                    ▲                           │
                                    │                   /retest-fixed-bugs
                                    │                           │
                     NOT_FIXED ─────┤           ┌───────────────┼────────────────┐
                     PARTIAL   ─────┘         FIXED                      CANNOT_VERIFY
                                                │                   (giữ trạng thái, ghi lý do)
                                                ▼
                                            ⬛ Đóng
```

| Trạng thái | Ai chuyển | Điều kiện |
|---|---|---|
| 🔴 Đang mở | Tester | Bug report đủ Build/Version · TC ID · REQ ID · evidence |
| 🟡 Đã fix — chờ retest | Dev | Có build chứa bản sửa |
| ⬛ Đóng | Tester | Retest `FIXED` — lặp ≥ 2 lần theo Steps gốc |
| 🔴 Mở lại | Tester | Retest `NOT_FIXED` hoặc `PARTIAL` — **không** tạo bug trùng |

> Phiếu `Quy trình trạng thái: riêng` (VD workflow Jira có *Từ chối* · *Trùng* · *Hoãn*) → thay sơ đồ và bảng bằng quy trình đó, **giữ** cột *Ai chuyển* và *Điều kiện*. Bug *Hoãn* vẫn tính là **đang mở** khi chấm tiêu chí exit #1, #2 — trừ khi người có quyền ở 4.2 chấp nhận bằng văn bản.

### 9.2 Thang Severity

> Mặc định chép **nguyên văn** `skills-bug-reporter` — *Severity & Priority Guide*. Tiêu chí exit #1, #2 đếm theo thang này.

| Severity | Định nghĩa | Ví dụ |
|---|---|---|
| 🔴 **Critical** | Chặn luồng chính, mất data, crash, security | Không login được, thanh toán sai tiền |
| 🟠 **Major** | Chức năng chính sai nhưng có workaround | Filter sai kết quả, export thiếu cột |
| 🟡 **Minor** | Chức năng phụ sai, UI lệch ảnh hưởng sử dụng | Validation message sai, sort không đúng |
| 🟢 **Trivial** | Lỗi hiển thị nhỏ, không ảnh hưởng chức năng | Sai chính tả, lệch margin |

### 9.3 Thang Priority

| Priority | Định nghĩa |
|---|---|
| **P1** | Fix ngay trong sprint hiện tại / hotfix |
| **P2** | Fix trong sprint kế tiếp |
| **P3** | Fix khi có thời gian (backlog) |

> Severity đánh giá theo **mức ảnh hưởng kỹ thuật**; Priority theo **mức khẩn cấp business**. Hai giá trị độc lập nhau. Tester đề xuất Severity; **Priority do người phân loại lỗi chốt**.

### 9.4 Phân loại lỗi & thời hạn xử lý

| | |
|---|---|
| Người phân loại lỗi (triage) | <theo phiếu> |
| Họp phân loại lỗi | <tần suất> |
| Bug đang mở tại ngày lập | <Critical n · Major n · Minor n · Trivial n — đếm từ `docs/bugs/`> |

| Severity | Thời hạn phản hồi | Thời hạn sửa xong |
|---|---|---|
| Critical | | |
| Major | | |
| Minor | | |
| Trivial | | |

> Thời hạn **không có mặc định** — phiếu trống → `❓`. Bug quá hạn là dữ liệu cho mục *trở ngại* của báo cáo tiến độ.

## 10. Sản phẩm bàn giao

| Sản phẩm | Nơi lưu | Workflow sinh ra |
|---|---|---|
| Master Test Plan + bản lưu phiếu | `docs/test-plans/test_plan_<slug>.md` · `test_plan_<slug>.input.yaml` | `/generate-master-test-plan` |
| Tài liệu requirements | `docs/requirements/<module>/` — tầng `web/` · `mobile/` · `api/` | `/generate-requirements-from-website` · `/generate-requirements-from-mobile` · `/generate-requirements-from-api` |
| Test cases | `docs/testcases/<module>/` — tầng `web/` · `mobile/` · `api/` | `/generate-testcases-manual-rbt` (web · mobile) · `/generate-testcases-api` (api) |
| Execution report | `docs/executions/<module>/<nền-tảng>/run_*/` | `/execute-test-cases` (web · mobile) |
| Retest report | `docs/executions/<module>/<nền-tảng>/retest_*/` | `/retest-fixed-bugs` |
| Bug report | `docs/bugs/<module>/<nền-tảng>/` | `/create-bug-report` |
| Automation script + report | Project automation · `reports/` | `/generate-automation-web` · `/generate-automation-mobile` · `/generate-automation-api` |
| Ma trận truy vết | `docs/traceability/traceability_matrix.md` | `/generate-traceability-matrix` |
| **Báo cáo tiến độ** | `docs/executions/test_progress_<slug>_<YYYYMMDD>.md` | `/generate-test-progress-report` |
| **Báo cáo tổng hợp** | `docs/executions/test_summary_<slug>_*.md` | `/generate-test-summary-report` |

> Chỉ giữ dòng của nền tảng và loại test có trong phạm vi.

## 11. Phê duyệt

| Vai trò | Tên | Phiên bản duyệt | Ngày | Ý kiến |
|---|---|---|---|---|

## 12. Ánh xạ chuẩn tài liệu

### 12.1 Đối chiếu mục

> Tài liệu này biên soạn **theo cấu trúc** ISO/IEC/IEEE 29119-3 — Test Plan và phủ đủ nội dung điển hình của test plan theo **ISTQB CTFL v4.0 mục 5.1.1**. Cột IEEE 829 theo **khung Test Plan bản 1998**. Bảng dưới để người duyệt đối chiếu; **không** phải tuyên bố đã được đánh giá tuân thủ.

<chép nguyên Bảng ánh xạ ba chuẩn ở mục "Chuẩn tham chiếu" của workflow, cột đầu chỉ ghi số mục>

**Rủi ro sản phẩm:** plan chỉ tóm tắt ở 8.2 — nguồn chính là tài liệu requirements và test case của từng module.

**Phần mở rộng ngoài khung chuẩn:** 3.7 Chiến lược tự động hoá · 9 Quản lý lỗi.

### 12.2 Điểm làm khác chính sách & chiến lược kiểm thử chung (Deviations)

| Làm khác ở đâu | Test Policy / Test Strategy quy định | Đợt này làm | Lý do | Ai duyệt |
|---|---|---|---|---|

> Tổ chức không có cả Test Policy lẫn Test Strategy → ghi `Không áp dụng — tổ chức chưa có Test Policy và Test Strategy`. **Đừng để trống.**
```
