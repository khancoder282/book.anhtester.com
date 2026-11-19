---
name: execute-test-cases
description: Thực thi manual test cases trên browser thật (Playwright MCP) hoặc app mobile Android/iOS thật (Appium MCP) — chấm PASS/FAIL/BLOCKED/SKIPPED, thu evidence (ảnh + video từng TC), xuất execution report (HTML nhúng ảnh + video khi được yêu cầu). Dành cho tester manual, KHÔNG sinh code automation.
argument-hint: "[file TC hoặc checklist] [phạm vi: tag · TC ID] [Quay video: Có|Chỉ giữ FAIL|Không]"
---

> **Skill nền tảng cần nạp trước:** `skills-manual-test-executor` · `skills-bug-reporter` — đọc `.claude/skills/<tên-skill>/SKILL.md` của từng skill trước khi bắt đầu.

# Workflow: Thực Thi Manual Test Cases

Chạy bộ manual test cases trực tiếp trên browser thật (TC web) hoặc app trên thiết bị thật / emulator (TC mobile), đối chiếu Expected vs Actual, chấm trạng thái và xuất báo cáo kết quả.

## Mode — theo thư mục của file TC

| Mode | File TC | Công cụ | Chi tiết trong skill |
|---|---|---|---|
| **WEB** (mặc định) | `<module>/web/` | Playwright MCP — server `playwright` | mục *Thứ tự thao tác browser* · *Video quay màn hình* |
| **MOBILE** | `<module>/mobile/` | Appium MCP — server `appium-mcp` (khai trong `.mcp.json`) | mục *Chạy trên app mobile (Appium MCP)* |

Agent tự nhận mode theo đường dẫn file TC. TC `api/` **không** chạy ở đây. iOS chỉ chạy được trên macOS. Bảng chọn đầy đủ: mục *Nền tảng chạy* của skill.

## ⚠️ Nguyên tắc

- **Chạy thật, không suy đoán** — mọi PASS/FAIL phải dựa trên quan sát UI qua `snapshot` (web) / `appium_get_page_source` (mobile)
- **TC là chuẩn** — thực tế lệch TC thì ghi FAIL, **TUYỆT ĐỐI KHÔNG sửa TC** cho khớp
- **Web: headed mode, viewport theo `--viewport-size` lúc launch** (bảng ở `.claude/rules/playwright_rules.md` mục 1) — tester phải nhìn được agent đang thao tác, KHÔNG resize phóng vượt cửa sổ
- **Mobile: thao tác theo locator, CẤM bấm toạ độ** (`.claude/rules/appium_rules.md` mục 5) — một phiên Appium cho cả lần chạy, đóng phiên khi xong
- **Mặc định mỗi TC đã chạy có 1 video** ở `<run_id>/video/` — ngang cấp `evidence/` (web WebM, mobile MP4). Tắt được bằng input `Quay video` (mục *Video quay màn hình* của skill)
- Tất cả output bằng **Tiếng Việt**

## Input cần thu thập

| Input | Bắt buộc? | Ghi chú |
|---|---|---|
| File TC hoặc checklist | ⭐ Bắt buộc | VD `docs/testcases/customers/web/test_cases_customers_web.md` · `docs/testcases/customers/web/parts/part_01_web_danh_sach.md` · `docs/testcases/_book-api/auth/mobile/parts/part_01_mobile_dang_nhap.md` · `docs/checklists/customers/web/checklist_smoke_20261009.md`. User đưa file **index** → đọc `## Bản đồ tài liệu`, lấy file `web/` hoặc `mobile/` theo nền tảng user chọn — không nói → **hỏi** (không lấy `api/`) · Danh sách TC ID từ `/select-regression-tests` (`docs/quality-insights/test_selection_*.md`) → **không** cần đưa file TC: agent tra file TC chứa từng TC ID |
| Phạm vi chạy | ⭐ Bắt buộc | Toàn bộ · theo tag (`@Smoke`) · theo TC ID range · theo nhóm chức năng · **danh sách TC ID** theo thứ tự (khối *Phạm vi cho `/execute-test-cases`* của `/select-regression-tests`). **Không có → agent hỏi**, không tự chạy hết |
| URL & tài khoản | ⭐ Bắt buộc | **Web:** môi trường đang test + tài khoản đăng nhập · **Mobile:** app (package / bundle ID, file cài nếu chưa có trên máy) + tài khoản. Thiết bị lấy theo dòng `Nền tảng` của file TC |
| Môi trường dùng chung? | ⭐ Bắt buộc | Có → bật auto-skip TC phá huỷ; Không → chạy đầy đủ, ghi rõ trong report |
| Build / Version | Khuyến nghị | Để truy vết kết quả về đúng bản build |
| Quay video | Tuỳ chọn — mặc định **`Có`** | `Có` · `Chỉ giữ FAIL` (quay hết, xoá video TC PASS) · `Không` (*"không quay video"*). Không nói → `Có`, không hỏi thêm |

> Phạm vi là **danh sách TC ID** (thường từ `/select-regression-tests`) → chạy **đúng thứ tự** đã cho. Danh sách trải nhiều module / nền tảng → tách thành **nhiều lần chạy**, mỗi lần một module × một nền tảng (`executions/<module>/<nền-tảng>/run_*`), các lần chạy xếp theo vị trí TC đầu tiên của nhóm trong danh sách — công bố kế hoạch tách trước khi chạy. TC ID không tìm thấy trong file TC nào, hoặc mang `@Deprecated` → liệt kê riêng, không chạy, báo user.

## Các bước thực hiện

### Bước 1: Xác nhận phạm vi
1. Đọc file TC, lọc theo phạm vi user chọn — **loại luôn TC `@Deprecated`** (không chạy, không tính tổng, không tính SKIPPED; ghi số đã loại ở header report)
2. Đếm số TC sẽ chạy, ước tính thời gian
3. Công bố kế hoạch trước khi bắt đầu:
   ```
   Sẽ chạy: 36 TC (Part 1 — Danh sách khách hàng)
   Dự kiến SKIPPED: 2 TC (thao tác phá huỷ)
   Ước tính: ~60 phút
   ```

### Bước 2: Chuẩn bị
1. Tạo `run_id` dạng `run_<timestamp>`
2. Tạo thư mục evidence `docs/executions/<module>/<nền-tảng>/<run_id>/evidence/` và — khi `Quay video` ≠ `Không` — thư mục **`video/` ngang cấp** — `<nền-tảng>` là thư mục của file TC đang chạy: `web` hoặc `mobile` (Android và iOS chung `mobile/`, mỗi hệ điều hành một lần chạy). TC `api/` không chạy ở đây. Hệ thống trong namespace (`docs/testcases/_book-api/…`) → `docs/executions/_book-api/<module>/<nền-tảng>/`. Checklist Release-readiness (`docs/checklists/_release/<nền-tảng>/`) thì `<module>` là **`_release`**
3. Khởi tạo file report `docs/executions/<module>/<nền-tảng>/<run_id>/execution_report.md` với phần header — **bắt buộc** có ô `Loại nguồn` (`Bộ TC` / `Checklist <loại> · <Mã checklist>`) và ô `Video`. Mobile: ô `Nền tảng` ghi `` `mobile` · Android `` / `` `mobile` · iOS ``, thêm ô `Thiết bị` · `App` · `Công cụ`
4. `Quay video` ≠ `Không`: **web** kiểm có tool `browser_start_video` — không có → config `"capabilities": ["devtools"]` chưa nạp: dừng, báo user khởi động lại Claude Code hoặc chạy với `Quay video: Không` · **mobile** kiểm có tool `appium_screen_recording` và `ffmpeg -version` (quay > 180 giây cần ffmpeg)
5. **Mobile:** kiểm đủ bảng *Điều kiện trước khi chạy* của skill — tool `appium_*` đã nạp · `adb devices` thấy thiết bị · đúng phiên bản app · `font_scale` = `1.0` · đã đọc *Ghi chú kỹ thuật* trong `system_map.md`. Thiếu → dừng, báo user

### Bước 3: Khởi tạo phiên & đăng nhập

**Web**
1. `browser_navigate(url)`
2. **KHÔNG gọi `browser_resize`** — viewport đã đúng từ `--viewport-size` lúc launch MCP server
3. Chờ trang load xong → `browser_snapshot()`

**Mobile**
1. `select_device` (nhiều máy → `deviceUdid` theo `capabilities.json`) → `appium_session_management action=create platform=<android|ios>` — `capabilities.json` đã có `appPackage` · `appActivity` · `noReset`
2. `appium_app_lifecycle action=query_state` app cần test: app **lạ** đang ở foreground → đóng phiên, hỏi user (thiết bị có thể đang được dùng) · app cần test chạy nền → `activate`. Rồi chờ app sẵn sàng **theo điều kiện** (phần tử của màn hình đầu xuất hiện trong cây), không chờ cố định
3. `appium_get_page_source` xác nhận đang ở đúng màn hình

**Cả hai**
4. Đăng nhập, verify đã vào được hệ thống — **chưa quay video** ở bước này (mật khẩu không vào video)
5. **Không đăng nhập được → DỪNG NGAY**, báo user, không chạy tiếp

### Bước 4: Chạy từng TC
Với mỗi TC theo thứ tự:
1. **Kiểm tra Auto-Skip** — TC có tag `@PersonalOnly` (`Automation = No` **không** phải lý do bỏ qua — vẫn chạy bình thường), hoặc steps chứa Mass Delete / Select All / xoá qua URL GET / upload `.exe` / import hàng loạt → `⏭️ SKIPPED` + ghi lý do, sang TC tiếp. **Nhập chuỗi dài vào một field** (TC biên `max+1`) **không** phải lý do skip
2. **Bật quay** (bỏ qua khi `Quay video: Không`) — **mobile:** `appium_screen_recording action=start` (`timeLimit` · `videoSize` · `bitRate` theo mục *Video trên mobile* của skill), dừng xong chuyển file sang `video/<TC_ID>.mp4` · **web:** `browser_start_video` (`filename` = `docs/executions/<module>/<nền-tảng>/<run_id>/video/<TC_ID>.webm`, `size` = viewport) rồi `browser_video_chapter` (`title` = TC ID, `description` = Test Scenario, `duration` = `1500`). Video đầu tiên: kiểm file rơi đúng thư mục `video/` của run. Báo *"Browser is already in use"* → quay dự phòng bằng `page.screencast` qua `browser_run_code_unsafe` (bảng tình huống ở mục *Video quay màn hình* của skill)
3. **Dựng Pre-Condition** — không dựng được → `⚠️ BLOCKED` + ghi nguyên nhân. Pre-Condition đòi *"trình duyệt sạch"* / *"chưa đăng nhập"* → web: xoá cookie trước · mobile: đăng xuất bằng UI, hoặc `appium_app_lifecycle action=clear` khi tài liệu hệ thống / user cho phép xoá dữ liệu app — vì phiên của TC trước làm lệch kết quả (mục *Quy trình thực thi* · *Chạy trên app mobile* của skill)
4. **Thực hiện đúng từng bước** trong Test Steps — không tự thêm/bớt bước
5. **Verify từng Expected** bằng `snapshot` (web) / `appium_get_page_source` (mobile) sau mỗi bước có kết quả quan sát được. Mobile bấm qua `appium_find_element` → `appium_gesture tap`, locator nghi trùng thì kiểm `appium_find_elements` trước — **không** bấm toạ độ. TC đặc biệt chạy theo bảng **TC đặc biệt** của skill: TC gộp chạy **từng biến thể** (FAIL ghi mã `<TC ID>-<mã>`) · `@TechCheck` chấm phần chính, phần `🔧` kiểm nếu làm được · `@NeedsVerify` lệch thì ghi chú đối chiếu lại TC · mục checklist ghi **mã mục** `<Mã checklist>-<nn>` (VD `CL-smoke_20261009-03`), **không** ghi `#3` trần — đủ 5 luật ở mục *Chạy checklist* của skill
6. **Chấm trạng thái:**
   - Mọi Expected khớp → `✅ PASS`
   - Có Expected không khớp → `❌ FAIL` + **screenshot ngay tại bước fail** + ghi Actual vs Expected
   - Có Expected không verify được → `⚠️ BLOCKED` (KHÔNG phải PASS)
7. **Dừng quay** — `browser_stop_video` (web) / `appium_screen_recording action=stop` (mobile), trước khi dọn trạng thái. `Chỉ giữ FAIL`: TC PASS → xoá video vừa quay
8. **Ghi kết quả vào report ngay** (không dồn tới cuối buổi) — cột `Video` = `[▶](video/<TC_ID>.webm)` (mobile `.mp4`; TC gộp trên mobile mỗi biến thể một link `[▶ a](video/<TC_ID>-a.mp4)`) (video đã xoá / không quay → `—`); TC FAIL thêm dòng `Video` (thẻ `<video>`) vào chi tiết FAIL. `Quay video: Không` → không có cột `Video`
9. **Khôi phục trạng thái sạch** (web: đóng modal, về trang danh sách · mobile: TC chỉ điều hướng thì Back / về tab gốc; TC **có gõ vào form**, app treo hoặc văng thì `appium_app_lifecycle` terminate → activate — app Hybrid giữ dữ liệu form khi Back; đã tắt mạng thì **bật lại**) rồi verify trạng thái xuất phát và chạy TC tiếp theo

### Bước 5: Báo tiến độ
Sau mỗi 5–10 TC, báo 1 dòng:
```
Đã chạy 12/36 — PASS 10 · FAIL 1 · BLOCKED 0 · SKIPPED 1
```

### Bước 6: Teardown
1. Xoá toàn bộ dữ liệu đã tạo trong buổi chạy
2. Đối chiếu số liệu hệ thống trước/sau để xác nhận môi trường trả về nguyên trạng
3. Bản nào không xoá được → ghi rõ vào report để người khác xử lý
4. **Mobile:** `appium_session_management action=delete` — phiên còn mở sẽ giành thiết bị với lần chạy sau / `mvn test`

### Bước 7: Xuất report
Xuất `execution_report.md` theo template trong skill, gồm 6 mục: Tổng kết · Kết quả từng TC · Chi tiết FAIL · TC BLOCKED · Dữ liệu đã tạo & dọn dẹp · Đề xuất bước tiếp theo.

Đối chiếu thư mục `video/` với bảng mục 2: mọi TC đáng lẽ có video (theo giá trị `Quay video`) đều có file, mọi link `[▶]` đều trỏ tới file có thật. Ô `Video` ở header ghi đúng giá trị đã dùng.

**User yêu cầu xuất HTML** → `python scripts/user-guide/md2html.py <…>/execution_report.md <…>/execution_report.html --standalone` — nhúng sẵn mọi ảnh evidence + video, đặt cạnh file `.md` (mục *Xuất report sang HTML* của skill).

Nguồn là **checklist** → cập nhật lại cột `Trạng thái` · `Execution ID` và dòng `Trạng thái lấy từ:` của file checklist cho mọi mục đã chạy (luật 5, mục *Chạy checklist* của skill). Không đụng cột khác.

## Điều kiện DỪNG giữa chừng

Agent chạy tiếp qua TC fail (fail-forward), **chỉ dừng** khi:

| Điều kiện | Vì sao |
|---|---|
| 3 TC liên tiếp FAIL cùng nguyên nhân hạ tầng | Đăng nhập hỏng / server 500 / mất mạng — chạy tiếp tạo báo cáo rác |
| Không đăng nhập được từ đầu | Toàn bộ suite không chạy được |
| Phát hiện đã ảnh hưởng dữ liệu người khác | Ưu tiên dừng và khắc phục |

## Quy tắc quan trọng

- **Pass rate không tính SKIPPED vào mẫu số** — báo cả 2 con số: tổng số TC và số TC thực chạy
- Screenshot **chỉ** khi FAIL hoặc milestone quan trọng — không chụp mọi bước. Video thì quay **mọi** TC đã chạy (trừ SKIPPED) — trừ khi user tắt
- Mọi dữ liệu tạo ra phải traceable (`Auto_<Module>_<timestamp>`) và có kế hoạch xoá
- KHÔNG `browser_navigate` lại nếu đã ở đúng trang — tránh reload làm mất trạng thái đang test
- Mobile: KHÔNG mở phiên Appium mới cho từng TC — một phiên cho cả lần chạy; app văng thì `activate` lại trong phiên đang có

## Bước tiếp theo sau khi có report

| Tình huống | Làm gì |
|---|---|
| Có TC FAIL | `/create-bug-report` — sinh bug report chuẩn từ evidence đã thu. Mục checklist FAIL: bug đặt theo **module của mục** (cột `Module` với checklist release) |
| Nhiều TC FAIL cần gom nhóm root cause | `/analyze-test-report` |
| Cần đẩy kết quả lên Xray | `/import-test-results-xray` |
| TC FAIL do TC viết sai (không phải lỗi hệ thống), kể cả TC `@NeedsVerify` lệch Expected | `/review-testcases` mode FIX — **không sửa TC trong lúc chạy** |
