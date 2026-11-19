# Workflow Routing

When the user request matches a specific task, select the appropriate workflow skill in `.claude/skills/<workflow>/SKILL.md` (workflow skills have no `skills-` prefix).

### Generate test cases from requirements

> **Delegate:** Tác vụ này thuộc skill **`skills-rbt-manual-testing`** — không phải `skills-qa-automation-engineer`.

Use workflow: `generate-testcases-from-requirements` (QUICK mode), `generate-testcases-manual-rbt` (FULL RBT mode) hoặc `generate-checklist-test` (CHECKLIST mode).

Triggers when user asks:

- generate test cases → **delegate to `skills-rbt-manual-testing` (QUICK mode)**
- write manual test cases → **delegate to `skills-rbt-manual-testing` (QUICK mode)**
- test scenarios from requirement → **delegate to `skills-rbt-manual-testing` (QUICK mode)**
- sinh test cases đầy đủ / quy trình 6 bước → **delegate to `skills-rbt-manual-testing` (FULL RBT mode)**
- sinh checklist test / checklist smoke / danh sách rà soát trước release → **delegate to `skills-rbt-manual-testing` (CHECKLIST mode)**

---

### Generate automation from manual test case

Use workflow: `generate-automation-from-testcases`

Triggers when user asks:

- convert test case to automation
- generate Selenium automation
- generate Playwright automation from test case

---

### Generate automation from UI steps (chưa có TC)

Use workflow: `generate-automation-web` mode FLOW (web) · `generate-automation-mobile` mode FLOW (app mobile)

Triggers when user asks:

- automate this UI flow
- generate automation from steps
- run UI steps and generate Selenium script
- mở app, đăng nhập, tạo đơn — viết Appium giùm

---

### Generate API test cases

Use workflow: `generate-testcases-api` (sinh TC) → `generate-automation-api` (sinh code từ TC)

Triggers when user provides:

- Swagger URL
- OpenAPI specification
- Scalar / Redoc URL, Postman collection

> Module chưa có REQ API → chạy `generate-requirements-from-api` trước để TC có REQ neo vào. Có TC API rồi mới sinh code bằng `generate-automation-api` — không sinh code thẳng từ spec.

---

### Generate test data

Use workflow: `generate-test-data`

Triggers when user asks:

- generate test data
- generate boundary test data

---

### Analyze cross-module feature & generate combinatorial matrix

Use workflow: `generate-cross-module-test-plan`

> Workflow dành cho **tính năng phức tạp đi qua nhiều modules nối tiếp**. Sinh Data Flow Map + Ma trận kết hợp đa chiều (Output-Class Coverage mặc định / Pairwise / Full Cartesian).
>
> ⚠️ Rule bất biến: mỗi Expected Output class phải xuất hiện ≥1 lần trong ma trận. Pairwise phủ *cặp*, KHÔNG đảm bảo phủ output class.

Triggers when user asks:

- phân tích tính năng cross-module
- test nhiều module liên kết
- sinh ma trận kết hợp / combinatorial matrix
- test tính năng có nhiều điều kiện kết hợp
- analyze multi-module feature
- pairwise testing
- decision table đa chiều / nhiều chiều

---

### Generate combinatorial test data (multi-module pipeline)

Use workflow: `generate-combinatorial-test-data`

> Sinh test data cho ma trận kết hợp. Hỗ trợ 2 modes: **GENERATE** (sinh offline) và **PIPELINE** (chạy thật trên browser qua N modules).

Triggers when user asks:

- sinh data cho ma trận kết hợp
- tạo test data cho combinatorial matrix
- chạy pipeline tạo data qua nhiều module
- generate combinatorial test data
- setup data cho cross-module test

---

### Generate regression suite

> **Không có workflow riêng.** Dùng `generate-application-test-plan` (Mode PLAN) hoặc `generate-testcases-manual-rbt` (FULL RBT) tùy theo input.

Triggers when user asks:

- create regression test suite
- generate regression scenarios

---

### Generate automation framework

> **Delegate:** Tác vụ này sử dụng skill **`skills-framework-architect`** để thiết kế framework.

Use workflow: `generate-automation-framework`

Triggers when user asks:

- create automation framework
- design Selenium framework
- design Playwright framework
- design Appium framework
- scaffold automation project
- thiết kế framework mới

---

### Explore application and generate test plan

Use workflow: `generate-application-test-plan`

> Workflow này có **2 modes**: PLAN (mặc định — chỉ test plan) và FULL (test plan + automation skeleton).
> Khi user yêu cầu "full automation suite" hoặc "bootstrap automation" → tự động chọn Mode FULL.

Triggers when user asks:

- explore application
- discover test scenarios
- generate test plan
- generate full automation suite
- bootstrap automation for project

---

### Run existing suite & fix failures

> **Delegate:** skill **`skills-test-report-analyzer`** để phân loại failure.

Use workflow: `run-and-fix-tests`

> Dành cho suite **đã có code**. 2 modes: RUN (chạy + báo cáo) và FIX (chạy + sửa + chạy lại).
>
> 🚨 Rule bất biến: **KHÔNG sửa test cho xanh khi nguyên nhân là bug của app.** Nhóm 🐛 giữ nguyên đỏ → `create-bug-report`. Nhóm 🌐 Environment → dừng, báo user.

Triggers when user asks:

- chạy regression / chạy suite / chạy test đi
- suite đang đỏ, xử lý giùm
- fix cho test xanh lại
- run tests and fix failures
- CI đỏ, sửa giùm

---

### Update existing automation from Delta TC List (delta mode)

> **Delegate:** skill **`skills-coverage-traceability`** để map TC ID ↔ script · recon theo nền tảng: **`skills-ui-debug-agent`** (web) · **`skills-mobile-debug-agent`** (mobile) · `skills-requirements-analyzer` mục 3.4.4 (API).

Use workflow: `update-automation-from-impact`

> Mắt xích **cuối** của chuỗi delta 3 tầng: `update-requirements-from-ticket` → `update-testcases-from-impact` → workflow này. Đầu vào là file **`docs/testcases/<module>/impact/delta_tc_<TICKET-ID>.md`** do tầng giữa ghi ra — chỉ có Impact Report mà chưa có file này nghĩa là TC chưa đồng bộ, phải dừng. Bỏ tầng giữa là sửa script theo kỳ vọng cũ — TC còn mô tả hành vi cũ thì script sửa xong vẫn sai mà vẫn xanh.
>
> TC đổi → sửa **đúng phần đổi** trong script đã có, **tách theo nền tảng** của TC (web · mobile `@Android`/`@iOS` · API), mỗi nền tảng một lượt. 2 modes: PLAN (kế hoạch) và APPLY (sửa + chạy lại).
>
> ⚠️ Rule bất biến: **KHÔNG sinh lại cả module** (đó là `generate-automation-from-testcases`), **KHÔNG xoá file** cho TC 🗑️ Deprecated, **KHÔNG sửa script** của TC `⏸️ @NeedsVerify` chưa được sửa, **KHÔNG bịa mapping** TC ↔ script.

Triggers when user asks:

- TC đổi rồi, cập nhật script
- requirement này đổi, script nào phải sửa
- đồng bộ automation với test case mới
- update automation after requirement change
- thay đổi này ảnh hưởng test nào

---

### Scan & heal broken locators

> **Delegate:** skill **`skills-locator-healer-agent`**.

Use workflow: `heal-locators`

> Dành cho **UI vừa đổi** làm locator gãy hàng loạt — rà chủ động, KHÔNG cần error log. 2 modes: SCAN (báo cáo) và HEAL (sửa + verify).

Triggers when user asks:

- UI đổi rồi, locator gãy hết
- rà lại locator trong Page Object
- cập nhật locator sau khi deploy frontend
- heal locators / fix broken selectors
- kiểm tra locator còn dùng được không

---

### Review automation code quality

> **Delegate:** skill **`skills-automation-code-reviewer`**.

Use workflow: `review-automation-code`

> Soi code automation **đã có** theo Definition of Done: hard sleep, locator inline, thiếu Allure metadata/screenshot, assertion yếu (pass giả). 2 modes: REVIEW và FIX.

Triggers when user asks:

- review code automation
- script này viết ổn chưa
- kiểm tra code trước khi bàn giao / merge
- dọn code test / cleanup automation
- test xanh nhưng có đáng tin không

---

### Analyze flaky tests

Use workflow: `analyze-flaky-tests`

Triggers when user asks:

- why is this test flaky
- analyze unstable automation

---

### Generate stable locators

Use workflow: `generate-locator`

Triggers when user asks:

- generate locator for this element
- find stable selector
- create automation locator

---

### Generate requirements from website

Use workflow: `generate-requirements-from-website`

Triggers when user asks:

- generate requirements from website
- analyze website module and create requirements
- extract user stories from web page

---

### Generate requirements from mobile app

Use workflow: `generate-requirements-from-mobile`

Triggers when user asks / provides:

- generate requirements from mobile app, Android/iOS screen
- file `.apk` / `.ipa`, package / bundle id kèm yêu cầu "phân tích", "sinh requirements"

---

### Generate requirements from API spec

Use workflow: `generate-requirements-from-api`

Triggers when user provides, **không kèm Ticket ID**:

- Swagger UI / Scalar / Redoc URL, OpenAPI JSON/YAML
- Postman collection
- Tài liệu API dạng .docx / .pdf (bảng endpoint, JSON mẫu, bảng mã lỗi)

---

### Analyze requirement document

> **Delegate:** Tác vụ này sử dụng skill **`skills-requirements-analyzer`** để phân tích requirement documents.

Use workflow: `analyze-requirement-document`

> Workflow chỉ **phân tích** requirement — KHÔNG sinh test cases. Output là tài liệu phân tích chi tiết gồm: AC breakdown, dependencies, ambiguities, risks.

Triggers when user asks:

- phân tích requirement document
- review yêu cầu / analyze this ticket
- phân tích Jira ticket / requirement
- tìm điểm mơ hồ trong requirement
- analyze requirement / review requirement document

---

### Fetch requirements from Jira

Use workflow: `fetch-jira-requirements`

Triggers when user asks:

- fetch jira requirements
- lấy requirement từ jira
- get jira ticket
- import user stories from jira

---

### Import test results to Xray

Use workflow: `import-test-results-xray` — **user tự gõ `/import-test-results-xray`**, agent không tự gọi

Triggers when user asks:

- push test results to xray
- đẩy kết quả test lên xray
- import test execution to jira
- upload playwright results to xray

---

### Update requirements from ticket (delta mode)

> **Delegate:** skill **`skills-requirements-analyzer`**.

Use workflow: `update-requirements-from-ticket`

> Cập nhật tài liệu requirements **đã có** — nhận diện THÊM/SỬA/BỎ, giữ nguyên REQ ID, ghi Nhật ký thay đổi, xuất Impact Report cho test cases.
>
> Bước kế tiếp là `update-testcases-from-impact` (đồng bộ TC, giữ nguyên TC ID), rồi mới tới `update-automation-from-impact`.

Triggers when user asks:

- cập nhật requirements từ ticket mới
- có ticket thay đổi yêu cầu
- update requirement document
- requirement này đổi rồi, cập nhật lại tài liệu

---

### Review manual test cases

> **Delegate:** skill **`skills-testcase-reviewer`**.

Use workflow: `review-testcases`

> 2 modes: REVIEW (chỉ báo cáo) và FIX (báo cáo + sửa TC).

Triggers when user asks:

- review test cases
- đánh giá chất lượng test case
- test case này ổn chưa
- tìm coverage gap trong test cases

---

### Execute manual test cases on browser

> **Delegate:** skill **`skills-manual-test-executor`**.

Use workflow: `execute-test-cases`

> Chạy manual TC trên browser thật qua Playwright MCP, chấm PASS/FAIL/BLOCKED/SKIPPED. **KHÔNG** sinh code automation.

Triggers when user asks:

- thực thi test cases
- chạy manual test trên browser
- execute test cases
- test thử các TC này trên hệ thống

---

### Analyze test report

> **Delegate:** skill **`skills-test-report-analyzer`**.

Use workflow: `analyze-test-report`

Triggers when user asks:

- phân tích test report
- tổng hợp kết quả chạy test
- vì sao nhiều test fail
- analyze playwright/allure report

---

### Create bug report

> **Delegate:** skill **`skills-bug-reporter`**.

Use workflow: `create-bug-report`

Triggers when user asks:

- tạo bug report
- viết bug từ test fail
- log bug lên Jira
- create bug report from failure

---

### Generate traceability matrix (RTM)

> **Delegate:** skill **`skills-coverage-traceability`**.

Use workflow: `generate-traceability-matrix`

Triggers when user asks:

- sinh ma trận truy vết / RTM
- requirement nào chưa có test case
- TC nào chưa được automate
- coverage matrix / traceability matrix

---

### Generate API mocks

> **Delegate:** skill **`skills-api-mocking`**.

Use workflow: `generate-api-mocks`

Triggers when user asks:

- mock API
- giả lập response 500 / timeout
- test UI khi backend chưa xong
- stub API cho edge case
