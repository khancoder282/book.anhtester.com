---
name: skills-qa-automation-engineer
description: Skill hỗ trợ agent thực hiện các tác vụ QA automation testing bao gồm generate test cases, automation scripts, API tests, locators, phân tích flaky tests, và tạo test data.
user-invocable: false
---

# QA Automation Engineer

## Description

This skill enables the agent to assist with software testing and automation tasks.

The agent can:

- Generate manual test cases from requirements
- Generate test automation scripts from test cases or UI flows
- Generate API tests from Swagger/OpenAPI specifications
- Explore applications and discover test scenarios
- Generate automation frameworks
- Generate test data
- Run an existing suite, triage failures and fix what QA can fix
- Scan and heal broken locators after a UI change
- Review the quality of existing automation code
- Analyze flaky tests
- Generate stable locators
- Generate requirements from website analysis

This skill is designed for modern QA workflows and automation development.

---

# When to Use

Use this skill when the user asks about:

- Test automation
- Manual testing
- Automation frameworks
- API testing
- UI testing
- Test data generation
- Flaky test debugging
- Locator generation
- Requirements analysis from website
- Jira integration (fetch requirements, push test results)
- Xray test management

Typical prompts include:

- Generate test cases from requirement
- Generate Selenium automation from test case
- Generate automation from UI steps
- Generate API tests from Swagger
- Generate regression suite → _(redirect sang `generate-application-test-plan` hoặc `generate-testcases-manual-rbt`)_
- Generate test data
- Analyze flaky test
- Generate locator for element
- Generate requirements from website

---

# Workflow Routing

> 📖 Nội dung đầy đủ ở [`references/workflow_routing.md`](references/workflow_routing.md) — **đọc khi:** cần trigger chi tiết, ghi chú delegate của từng tác vụ.

| Tác vụ | Workflow / mode |
|---|---|
| Generate test cases from requirements | `generate-testcases-from-requirements` (QUICK mode), `generate-testcases-manual-rbt` (FULL RBT mode) hoặc `generate-checklist-test` (CHECKLIST mode). |
| Generate automation from manual test case | `generate-automation-from-testcases` |
| Generate automation from UI steps (chưa có TC) | `generate-automation-web` mode FLOW (web) · `generate-automation-mobile` mode FLOW (app mobile) |
| Generate API test cases | `generate-testcases-api` (sinh TC) → `generate-automation-api` (sinh code từ TC) |
| Generate test data | `generate-test-data` |
| Analyze cross-module feature & generate combinatorial matrix | `generate-cross-module-test-plan` |
| Generate combinatorial test data (multi-module pipeline) | `generate-combinatorial-test-data` |
| Generate regression suite | Không có workflow riêng — dùng `generate-application-test-plan` (Mode PLAN) hoặc `generate-testcases-manual-rbt` (FULL RBT) tùy theo input. |
| Generate automation framework | `generate-automation-framework` |
| Explore application and generate test plan | `generate-application-test-plan` |
| Run existing suite & fix failures | `run-and-fix-tests` |
| Update existing automation from Delta TC List (delta mode) | `update-automation-from-impact` |
| Scan & heal broken locators | `heal-locators` |
| Review automation code quality | `review-automation-code` |
| Analyze flaky tests | `analyze-flaky-tests` |
| Generate stable locators | `generate-locator` |
| Generate requirements from website | `generate-requirements-from-website` |
| Generate requirements from mobile app | `generate-requirements-from-mobile` |
| Generate requirements from API spec | `generate-requirements-from-api` |
| Analyze requirement document | `analyze-requirement-document` |
| Fetch requirements from Jira | `fetch-jira-requirements` |
| Import test results to Xray | `import-test-results-xray` — **user tự gõ `/import-test-results-xray`**, agent không tự gọi |
| Update requirements from ticket (delta mode) | `update-requirements-from-ticket` |
| Review manual test cases | `review-testcases` |
| Execute manual test cases on browser | `execute-test-cases` |
| Analyze test report | `analyze-test-report` |
| Create bug report | `create-bug-report` |
| Generate traceability matrix (RTM) | `generate-traceability-matrix` |
| Generate API mocks | `generate-api-mocks` |

---

# Automation Framework

Default stack theo platform — dùng khi user **không chỉ định**. Bảng này là nguồn duy nhất; workflow `generate-automation-framework` (Bước 1) tuân theo đúng bảng này.

| Platform | Framework mặc định | Ngôn ngữ | Runner | Report |
|---|---|---|---|---|
| 🌐 Web | **Playwright** | TypeScript | Playwright Test | HTML Report + Allure |
| 📱 Mobile | **Appium** | Java | TestNG | Allure |
| 🔌 API | **REST Assured** | Java | TestNG | Allure |

- **Design pattern:** Page Object Model (POM) — mobile dùng Screen Object
- **Stack thay thế** (khi user yêu cầu): Selenium WebDriver + Java + TestNG cho Web, Playwright + Java/Python
- **Danh sách đầy đủ 8 stacks được hỗ trợ:** xem `skills-framework-architect` > Supported Stacks

> ⚠️ **KHÔNG tự chọn stack khi user đã nêu ràng buộc** (team dùng Java, CI chỉ có Maven…). Hỏi xác nhận trước khi scaffold.

---

# Locator Strategy

## Selenium Locator Priority

1. `id`
2. `data-testid`
3. `name`
4. `css selector`
5. `xpath` (last resort)

Avoid fragile locators such as auto-generated class names or positional xpaths.

## Playwright Locator Priority

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()`
6. `css selector`
7. `xpath` (last resort)

Avoid fragile selectors such as dynamic class names.

> **Note:** For detailed locator rules, refer to `.claude/rules/locator_strategy.md`.

---

# Rules References

The agent MUST also follow the detailed rules defined in `.claude/rules/`:

- [`.claude/rules/automation_rules.md`](../../rules/automation_rules.md) — General automation best practices
- [`.claude/rules/reporting_rules.md`](../../rules/reporting_rules.md) — Allure report: metadata, step, screenshot, cấm stdout
- [`.claude/rules/locator_strategy.md`](../../rules/locator_strategy.md) — Detailed locator selection rules
- [`.claude/rules/playwright_rules.md`](../../rules/playwright_rules.md) — Playwright-specific rules
- [`.claude/rules/selenium_rules.md`](../../rules/selenium_rules.md) — Selenium-specific rules
- [`.claude/rules/appium_rules.md`](../../rules/appium_rules.md) — Appium mobile automation rules

---

# References

## Ngữ cảnh dự án — agent TỰ KHÁM PHÁ, không có file template điền tay

Skill này **không** kèm file hồ sơ dự án để user điền sẵn. Agent tự thu thập và tự ghi lại:

| Cần biết | Lấy ở đâu | Ghi vào đâu |
|---|---|---|
| **Hệ thống có những module nào** (chưa biết gì về hệ thống) | `/discover-system` — crawl navigation cấp hệ thống | `docs/requirements/_discovery/system_map.md` + `README.md` |
| Module X làm gì, luồng nào, field nào | **Recon UI thực tế** qua Playwright MCP — `/generate-requirements-from-website` (web) · qua Appium MCP — `/generate-requirements-from-mobile` (app) | `docs/requirements/<module>/REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` |
| Mặt API của module X — endpoint, schema, auth | `/discover-system` nhánh API → `/generate-requirements-from-api` (Swagger · Scalar · Postman · tài liệu API .docx) | `docs/requirements/<module>/api/requirements_<module>_api.md` + index — một nghiệp vụ một prefix, một thư mục module trên mọi nền tảng |
| Prefix module, mã REQ/TC kế tiếp | Đọc danh mục hiện có | `docs/requirements/README.md` · `docs/testcases/README.md` |
| Business rules ẩn, known issues (CAPTCHA, OTP…) | Gặp khi recon / chạy test → ghi lại ngay | Mục "Ghi chú" của tài liệu module + Nhật ký thay đổi |
| URL, tài khoản test | **User cung cấp lúc chat** | `.env` (git-ignored) — KHÔNG ghi vào tài liệu |
| Môi trường dùng chung hay không | **Hỏi user một lần** nếu chưa biết | Bộ nhớ phiên của Claude Code |

**Nguyên tắc:**
- Thiếu thông tin **suy ra được từ UI** → đi recon, KHÔNG hỏi user
- Thiếu thông tin **không thể suy ra** (credentials, môi trường dùng chung, ràng buộc nội bộ) → hỏi user **một lần**, rồi ghi lại để phiên sau khỏi hỏi lại
- **KHÔNG bịa** prefix, URL, hay business rule

External references:

- [`skills-framework-architect/references/PROJECT_STRUCTURE.md`](../skills-framework-architect/references/PROJECT_STRUCTURE.md) — Project structure cho 8 stacks (**nguồn duy nhất**)
- [`skills-framework-architect/references/CODE_TEMPLATES.md`](../skills-framework-architect/references/CODE_TEMPLATES.md) — Code mẫu base classes / factory / config
- `CLAUDE.md` > "Cleanup & Delivery" — Quality checklist / Definition of Done

---

# Output

Depending on the request, the agent may return:

- Manual test cases (structured format)
- Automation scripts (Java/TypeScript)
- API tests (REST Assured)
- Locator recommendations
- Test data (structured, randomized, traceable)
- Automation framework design
- Requirements documents

Automation outputs should include:

- Page Object classes
- Test classes
- Assertions validating expected behavior
- Clean, readable, maintainable code (no debug logs, no commented code)