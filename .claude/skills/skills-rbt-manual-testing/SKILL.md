---
name: skills-rbt-manual-testing
description: Skill sinh và cập nhật manual test cases với 4 modes — QUICK (sinh nhanh từ requirements), FULL RBT (quy trình AI-RBT 6 bước có đánh giá rủi ro), CHECKLIST (checklist rà soát ngắn để tick tay — smoke/regression/release) và DELTA (cập nhật bộ TC đã có theo Impact Report, giữ nguyên TC ID). Mọi mode sinh TC đều đi theo khung 4 vòng Smoke → Functional → Technical → Non-functional để không bỏ sót lớp kiểm thử nào. Master skill cho mọi tác vụ manual test case.
user-invocable: false
---

# RBT Manual Testing

## Description

Đây là **Master Skill** cho mọi tác vụ sinh và cập nhật manual test cases. Skill cung cấp **4 chế độ hoạt động** (modes) để phù hợp với mọi quy mô yêu cầu:

| Mode | Khi nào dùng | Output | Thời gian |
|------|-------------|--------|-----------|
| **QUICK** | Module đơn giản, cần TC nhanh, requirements rõ ràng | TC chi tiết có steps | 1 lượt (không chờ user) |
| **FULL RBT** | Module phức tạp, cần phân tích rủi ro, hệ thống lớn | TC chi tiết + Risk Level + RTM | 6 bước tuần tự (có checkpoint) |
| **CHECKLIST** | Cần danh sách rà soát ngắn để tick tay — smoke trước release, bàn giao tester, rà nhanh sau hotfix | Checklist 1 dòng/mục, có ô tick | 1 lượt (không chờ user) |
| **DELTA** | **Bộ TC đã có**, requirements vừa đổi theo ticket — chỉ sửa phần bị ảnh hưởng | TC sửa tại chỗ + Nhật ký thay đổi + Delta TC List | 1 lượt (1 checkpoint duyệt) |

> **3 mode đầu SINH TC mới. Mode DELTA SỬA TC đã có.** Dùng QUICK/FULL RBT trên module đã có TC là sinh trùng và đánh lại TC ID — vỡ truy vết sang automation.

**Nguyên tắc cốt lõi:**
- **Human Strategy:** Con người xác định chiến lược, mức độ rủi ro và tiêu chuẩn
- **AI Execution:** AI thực hiện phân tích, viết TCs và rà soát lỗ hổng
- **Human Verification:** Con người kiểm tra lại kết quả trước khi chốt

---

## When to Use

Sử dụng skill này khi:

- Sinh manual test cases từ requirements / user stories
- Phân tích requirements để phát hiện ambiguity
- Phân rã hệ thống thành modules / features
- Xây dựng traceability matrix
- Áp dụng Risk-Based Testing (đánh giá rủi ro cho test cases)
- Chuẩn hóa test cases sang bảng Markdown (Jira/Excel format)
- Sinh test cases nhanh từ requirements đơn giản
- Sinh checklist rà soát ngắn để tick tay (smoke / regression / release-readiness / post-hotfix)
- **Cập nhật bộ TC đã có** khi requirements đổi theo ticket (Mode DELTA)

**KHÔNG** sử dụng skill này khi:

- Cần sinh automation code → dùng `skills-qa-automation-engineer`
- Cần inspect DOM / sinh locator → dùng `skills-ui-debug-agent` / `skills-smart-locator-agent`
- Chỉ cần sinh test data → dùng `skills-test-data-generator`

---

## Mode Routing — Cách chọn mode

Agent tự động chọn mode dựa trên **trigger keywords** và **ngữ cảnh**:

**Nạp tài liệu tham chiếu theo mode** — file trong `references/`, đọc **trước** khi bắt đầu mode đó:

| Mode | Đọc |
|---|---|
| QUICK | `mode_quick.md` · `granularity.md` · `tc_design_rules.md` · `output_files.md` · `output_format.md` |
| FULL RBT | `mode_full_rbt.md` · `granularity.md` · `tc_design_rules.md` · `output_files.md` · `output_format.md` |
| CHECKLIST | `mode_checklist.md` · `output_files.md` · `output_format.md` |
| DELTA | `mode_delta.md` · `granularity.md` · `tc_design_rules.md` · `output_files.md` · `output_format.md` |

### → Mode QUICK

Kích hoạt khi:
- User dùng workflow `/generate-testcases-from-requirements`
- User nói: "sinh test cases nhanh", "tạo TC từ requirement này", "viết test cases cho form..."
- Requirements đã rõ ràng, scope nhỏ (1 module / 1 tính năng)
- User không yêu cầu phân tích rủi ro hay quy trình bài bản

### → Mode FULL RBT

Kích hoạt khi:
- User dùng workflow `/generate-testcases-manual-rbt`
- User nói: "quy trình 6 bước", "phân tích RBT", "sinh test cases đầy đủ", "sinh bộ TC bài bản"
- Scope lớn (nhiều modules, hệ thống phức tạp)
- User yêu cầu Traceability Matrix hoặc đánh giá Risk Level
- Requirements chưa rõ ràng, cần phân tích Ambiguity

### → Mode CHECKLIST

Kích hoạt khi:
- User dùng workflow `/generate-checklist-test`
- User nói: "sinh checklist test", "checklist smoke", "checklist trước release", "danh sách rà soát", "checklist bàn giao cho tester", "rà nhanh sau hotfix"
- User cần **danh sách tick tay** ngắn gọn, KHÔNG cần steps chi tiết
- User muốn rút gọn bộ TC chi tiết đã có thành checklist chạy nhanh

> Phân biệt: user cần **chạy tay nhanh và tick** → CHECKLIST. User cần **bộ TC lưu trữ, giao cho automation, import Jira/TestRail** → QUICK hoặc FULL RBT.

### → Mode DELTA

Kích hoạt khi:
- User dùng workflow `/update-testcases-from-impact`
- User đưa **Impact Report** (từ `/update-requirements-from-ticket`) hoặc danh sách REQ đã đổi
- User nói: "cập nhật TC theo ticket", "requirement đổi rồi, sửa TC", "TC nào bị ảnh hưởng", "đồng bộ lại bộ TC"
- Module **đã có** `docs/testcases/<module>/TEST_CASES_<TÊN_MODULE>_SUMMARY.md` và yêu cầu vừa thay đổi

> 🚨 **Dấu hiệu bắt buộc kiểm trước khi chọn QUICK/FULL RBT:** module đã có file TC chưa? Đã có mà vẫn chạy QUICK/FULL RBT kiểu sinh mới là sinh bộ TC thứ hai, TC ID đánh lại từ `001`, và mọi `testId` trong automation trỏ về hư không. Xử lý theo mục **Module đã có bộ TC — chế độ BỔ SUNG** ngay dưới.

### Module đã có bộ TC — chế độ BỔ SUNG (áp QUICK · FULL RBT)

**Bước 0 của mọi lượt QUICK / FULL RBT:** kiểm `docs/testcases/<module>/TEST_CASES_<TÊN_MODULE>_SUMMARY.md` (hoặc tên cũ `test_cases_<module>.md`). Không có → sinh mới bình thường. **Có** → rẽ nhánh:

| Tình huống | Làm gì |
|---|---|
| Requirements của REQ **đã có TC** vừa đổi | ⛔ Không sinh — chuyển **Mode DELTA** (`/update-testcases-from-impact`) |
| Có REQ **chưa có TC** (REQ 🟢 mới, hoặc REQ 🔴 thiếu ở Bảng Đối Soát Coverage) | Chạy **BỔ SUNG**: phạm vi chỉ gồm các REQ đó |
| User muốn **sinh lại cả module** | ⛔ Dừng, hỏi user. Chỉ được làm khi chưa có script / execution report / RTM nào trỏ vào bộ TC — cùng luật với *Đổi độ hạt của bộ TC đã có* |

**Luật của chế độ BỔ SUNG:**

- Phạm vi = REQ chưa có TC. **Không** chạm dòng TC đang có
- TC ID **nối tiếp** dải đang dùng (đọc `Dải TC ID đã dùng` ở index) — không chèn giữa, không đánh lại
- **Giữ độ hạt** của bộ TC đang có (GỘP/TÁCH), không theo tham số mặc định
- Ghi **nối vào** file nền tảng / part hiện có (vượt ngưỡng thì mở part mới), cập nhật index: Bản đồ tài liệu · Bảng Đối Soát Coverage · Bảng 4 vòng (chỉ nhánh bị chạm) · dải TC ID · 1 dòng **Nhật ký thay đổi** kèm **mốc git** của file trước khi ghi
- Quality Gate chạy trên **phần vừa sinh**, riêng tiêu chí 6 (Coverage) chạy trên **cả module**

### → Khi không rõ

Nếu không xác định được mode, agent **hỏi user**:
```
Bạn muốn làm gì với test cases?
1. QUICK — Sinh TC chi tiết nhanh từ requirements (không qua bước phân tích)
2. FULL RBT — Sinh TC theo quy trình 6 bước đầy đủ (phân tích → phân rã → RBT → sinh TC)
3. CHECKLIST — Sinh danh sách rà soát ngắn để tick tay (smoke / release / hotfix)
4. DELTA — Cập nhật bộ TC ĐÃ CÓ theo ticket vừa đổi requirements
```

---

## Quy Tắc Đối Chiếu Evidence (BẮT BUỘC — áp dụng cả 4 modes, chạy TRƯỚC batch đầu tiên)

Tài liệu requirements là **mô tả bằng chữ**; ảnh trong `docs/requirements/<module>/<nền-tảng>/evidence/` là **bằng chứng**. Sinh TC chỉ từ chữ dẫn tới bịa bố cục, nhãn, thứ tự tab, định dạng hiển thị — và không ai phát hiện được vì TC đọc vẫn rất thuyết phục.

**Thứ tự tin cậy khi ba nguồn mâu thuẫn:**

```
DOM thật (đọc trực tiếp) > Ảnh evidence > Tài liệu chữ
```

### 1. Mở toàn bộ evidence trước khi sinh TC

- Liệt kê `docs/requirements/<module>/<nền-tảng>/evidence/` của **nền tảng đang sinh TC** (tài liệu cũ chưa có tầng nền tảng: `docs/requirements/<module>/evidence/`) rồi **mở TỪNG ảnh bằng `Read`**. Không được bỏ ảnh nào vì "tên file nghe không liên quan"
- Ảnh của module liên quan (VD Projects tham chiếu Customers) cũng mở nếu TC chạm tới
- **Chưa mở evidence thì chưa được ghi dòng TC đầu tiên**

### 2. Xung đột giữa tài liệu và ảnh → ảnh thắng

Tài liệu ghi một đằng, ảnh cho thấy một nẻo → **KHÔNG tự chọn bên nào**. Bắt buộc:
1. Viết TC theo **những gì ảnh cho thấy**
2. Ghi một dòng `ASM-XX` nêu rõ xung đột, kèm tên tệp ảnh
3. Báo user ngay ở phần tóm tắt cuối — đây là **tín hiệu requirements đã lỗi thời**, cần recon lại

### 3. Evidence thiếu / cắt cụt → gắn `@NeedsVerify`, KHÔNG suy diễn

Ảnh chụp theo viewport thường **cắt mất phần dưới** của form dài (nút Save, checkbox cuối, rich text editor). Vùng không có ảnh chống lưng:

- TC vẫn được viết, nhưng **bắt buộc gắn tag `@NeedsVerify`** và ghi `⚠️ chưa có evidence` trong cột `Expected Result`
- Liệt kê ở mục **"Vùng chưa có evidence"** trong index, kèm đề xuất recon bổ sung theo chuẩn 7.2.1 của skill `skills-requirements-analyzer`
- **NGHIÊM CẤM** viết Expected Result khẳng định chắc chắn về thứ tự Tab, vị trí phần tử, nhãn nút, định dạng hiển thị khi không nhìn thấy trong ảnh

### 4. Bốn nhóm TC BẮT BUỘC phải có evidence chống lưng

| Nhóm TC | Vì sao không được suy diễn |
|---|---|
| Bố cục & thứ tự (tab order, thứ tự cột, thứ tự field) | Bố cục 2 cột làm thứ tự Tab **khác hẳn** thứ tự đọc từ trên xuống |
| Nhãn nguyên văn (nút, tiêu đề, thông báo, tooltip) | Sai một chữ là TC fail giả |
| Giá trị mặc định (checkbox tick sẵn, option đang chọn, multi-select chọn sẵn) | Đây là chỗ tài liệu hay lỗi thời nhất |
| Định dạng hiển thị (tiền tệ `$1,403.00`, giờ `100:00`, ngày `dd-mm-yyyy`, badge màu, avatar) | Assert sai định dạng là fail hàng loạt |

### 5. Có Playwright MCP → đọc DOM, đừng chỉ nhìn ảnh

Ảnh là **bằng chứng lưu trữ**; DOM là **nguồn chính xác**. Ảnh độ phân giải thường **không phân biệt nổi** `disabled` với `không tick`, không đếm được option nào đang `selected` trong multi-select bị cắt, không đọc được `value` hay `data-*`. Khi có Playwright MCP, sau khi mở ảnh hãy đọc thẳng DOM để chốt các con số:

```js
// Mẫu: chốt option, giá trị mặc định, trạng thái khoá — một lượt
() => {
  const q = s => document.querySelector(s);
  const sel = q('#<select_id>');
  return {
    options: [...sel.options].map(o => ({ v: o.value, text: o.text.trim(), subtext: o.getAttribute('data-subtext') })),
    selectedIndex: sel.selectedIndex,
    selectedValues: [...sel.options].filter(o => o.selected).map(o => o.value),
    checkboxes: [...document.querySelectorAll('<scope> input[type=checkbox]')]
      .map(c => ({ name: c.name, checked: c.checked, disabled: c.disabled })),
    fieldOrder: [...document.querySelectorAll('<form> input:not([type=hidden]), <form> select, <form> textarea')]
      .filter(e => e.offsetParent !== null).map(e => e.id || e.name)
  };
}
```

Những thứ **chỉ DOM mới chốt được**: số `<option>` thật (kể cả option rỗng) · `selectedIndex` · danh sách option đang `selected` · `disabled` vs `checked` · `data-subtext` / `data-*` · thứ tự focus thật của form · phần tử ẩn bằng class nhưng vẫn nằm trong DOM.

### 6. Trạng thái phần tử — đọc kỹ ảnh, đừng chỉ đọc nhãn

Checkbox **xám mờ = disabled**, khác hoàn toàn **không tick**. Phát hiện phần tử disabled trong ảnh nghĩa là có **business rule phụ thuộc** mà requirements có thể đã bỏ sót → sinh TC cho cả hai chiều (bật điều kiện → mở khoá; tắt điều kiện → khoá lại) và mở `AMB-<MODULE>-XX`.

---

## Quy Tắc Ngôn Ngữ Kiểm Chứng (BẮT BUỘC — áp dụng cả 4 modes)

> 🚨 Mục trên vừa nói **DOM là nguồn chính xác** — đúng, nhưng đó là luật cho khâu **khảo sát**. Mục này là luật cho khâu **viết TC**, và hai khâu đó KHÔNG dùng chung ngôn ngữ. Agent đọc DOM để **biết sự thật**; TC viết ra để **người khác kiểm chứng lại sự thật đó**.

Người chạy manual TC là **tester**, không phải người viết automation. Họ chấm PASS/FAIL bằng thứ **nhìn thấy trên màn hình**. Một Expected Result kiểu `body.className` chứa `user-id-2` bắt tester mở DevTools, gõ lệnh, đọc chuỗi — và tệ hơn: nó **không phát biểu được yêu cầu nghiệp vụ nào**. Người dùng đâu quan tâm class của thẻ `body`; họ quan tâm mình có vào được Dashboard không.

### 1. Câu hỏi bắt buộc trước khi viết mỗi dòng Expected Result

> **"Người dùng thật sẽ thấy điều này bằng cách nào?"**

Trả lời được bằng mắt thường → viết đúng cái nhìn thấy. Không trả lời được → thuộc nhóm ẩn, xử lý theo mục 3.

### 2. Bảng chuyển ngữ — DOM ❌ → Quan sát được ✅

| ❌ Ngôn ngữ DOM / DevTools | ✅ Viết trong manual TC |
|---|---|
| `document.title` chứa `Dashboard` · `body.className` chứa `user-id-2` | Vào được trang Dashboard, thanh tiêu đề trình duyệt ghi `Dashboard` |
| `input#email.checkValidity()` = `false` | Trình duyệt hiện cảnh báo ngay cạnh ô Email, biểu mẫu **không** gửi đi (trang không nạp lại, dữ liệu đã nhập còn nguyên) |
| Có `input#email[type=email]`, `input#password[type=password]`, `button[type=submit]` | Thấy đủ ô `Email Address`, ô `Password` (gõ vào hiện dấu chấm che), nút `Login` |
| `document.activeElement.id` = `email` | Con trỏ nhấp nháy sẵn trong ô Email, gõ được ngay không cần bấm chuột |
| `offsetParent` = `null`, hộp `0×0` | Không nhìn thấy trên màn hình |
| Đếm `.g-recaptcha` = `0`, `iframe[src*=recaptcha]` = `0` | Trên trang không có ô "Tôi không phải người máy", không có ảnh đố |
| `POST` trả `303`, header `location: /admin/` | Trang tự chuyển sang Dashboard |
| Thân request chứa 4 tham số `csrf_token_name`, `email`… | *(→ nhóm ẩn, xem mục 3)* |

**Nguyên tắc rút ra:** mã HTTP, header, thuộc tính DOM, selector, tab Network **là phương tiện agent dùng lúc khảo sát để chốt sự thật** — không phải ngôn ngữ để giao việc cho tester.

### 3. Nhóm ẩn — tách xuống `Ghi chú kỹ thuật`, gắn `@TechCheck`

Có những yêu cầu **thật sự không có biểu hiện nhìn thấy được**: cookie `autologin`, mã chống CSRF, header `Strict-Transport-Security`, chuyển hướng HTTP→HTTPS, mã `500` thân rỗng. Bỏ đi là mất vết kiểm bảo mật. Cách xử lý:

1. **Expected Result chính** vẫn viết bằng ngôn ngữ quan sát được — phát biểu **hệ quả nghiệp vụ** của cơ chế ẩn đó
2. Phần cấp kỹ thuật tách xuống một dòng riêng mở đầu bằng **`🔧 Ghi chú kỹ thuật (cần DevTools):`**
3. TC gắn tag **`@TechCheck`** để tester biết cần công cụ, và người lập bộ chạy biết TC này giao cho ai

```markdown
✅ Đúng:
| Expected Result |
| 3. Đăng nhập thành công, vào Dashboard<br>4. Đóng hẳn trình duyệt rồi mở lại `crm.anhtester.com/admin/` → **vẫn đang đăng nhập**, không phải nhập lại<br><br>🔧 Ghi chú kỹ thuật (cần DevTools): tồn tại cookie `autologin` khớp hình thái `a:2:{s:7:"user_id";...;s:3:"key";s:16:"<16 ký tự hex>";}`. 🔒 Chỉ ghi hình thái, KHÔNG chép giá trị thật |

❌ Sai (bắt tester đọc cookie mà không nói để làm gì):
| 6. Tồn tại cookie `autologin` khớp hình thái `a:2:{...}` — phần `key` dài đúng 16 ký tự hex |
```

> **Thước đo:** che dòng `🔧 Ghi chú kỹ thuật` đi, TC **vẫn phải chạy và chấm được**. Không chấm được nghĩa là chưa tìm ra hệ quả nghiệp vụ — quay lại tìm, đừng để phần kỹ thuật gánh cả TC.

### 4. Test Steps cũng theo luật này

Steps viết bằng **thao tác người dùng làm được**, không phải lệnh console.

| ❌ | ✅ |
|---|---|
| `5. Đọc mã trạng thái và header location của POST /admin/authentication` | `5. Quan sát trang sau khi bấm Login` |
| `1. Xác nhận $(".started-timers-top").find("li.timer").length > 0` | `1. Xác nhận trên thanh đầu trang đang hiện ít nhất 1 bộ đếm giờ chạy` |
| `4. Đọc document.querySelector('#email').getAttribute('value')` | `4. Nhìn ô Email sau khi trang nạp lại`<br>+ `🔧 Ghi chú kỹ thuật`: xem HTML máy chủ trả về (View Source), thẻ `input#email` phải mang `value=...` |

### 5. Ngoại lệ hợp lệ — được dùng ngôn ngữ kỹ thuật ở TC chính

| Trường hợp | Vì sao |
|---|---|
| `Auto Type` = `API` | TC gốc đã ở tầng giao thức, người chạy là người gọi API |
| Mode CHECKLIST mục dành riêng cho DevOps / security review | Người tick là kỹ sư, không phải tester nghiệp vụ |
| Tên nguyên văn của **nhãn hiển thị** (`Invalid email or password`, nút `Login`, tiêu đề `Forgot Password`) | Đây là thứ tester **đọc trên màn hình**, không phải DOM — vẫn bắt buộc ghi nguyên văn |
| URL đầy đủ (`https://crm.anhtester.com/admin/`) | Tester đọc được trên thanh địa chỉ |

### 6. Selector CSS/XPath — KHÔNG thuộc về manual TC

Selector là tài sản của tầng automation, sống trong Page Object. Nhét `.dropdown-menu > li.header-logout` vào manual TC gây hai hại: tester không dùng được, và khi UI đổi thì selector sai nằm rải trong tài liệu TC không ai đi sửa.

- Thông tin selector thu được lúc recon → ghi vào **`docs/requirements/<module>/REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md`** (mục kỹ thuật), workflow automation đọc từ đó
- Manual TC chỉ mô tả **vị trí nhìn thấy**: "mục `Logout` cuối cùng trong menu ảnh đại diện góc trên bên phải"

### 7. Self-Quality Gate — tiêu chí bổ sung

Trước khi xuất, agent rà lại **toàn bộ** cột `Test Steps` và `Expected Result`:

- [ ] Không còn `document.`, `querySelector`, `checkValidity`, `offsetParent`, `className`, `getAttribute`, `$(`, `input#`, `[type=` ở phần TC chính
- [ ] Không còn mã HTTP / tên header ở phần TC chính (trừ `Auto Type` = `API`)
- [ ] Mọi phần kỹ thuật còn lại nằm dưới `🔧 Ghi chú kỹ thuật (cần DevTools):` và TC đó có tag `@TechCheck`
- [ ] Che hết dòng `🔧 Ghi chú kỹ thuật` → mọi TC vẫn chạy và chấm được

---

## Quy Tắc Xuất File & Theo Dõi Tiến Độ (BẮT BUỘC — áp dụng cả 4 modes)

> 📖 Nội dung đầy đủ ở [`references/output_files.md`](references/output_files.md) — **đọc khi:** mọi mode — **trước khi ghi file TC đầu tiên**.
>
> Gồm: 1. Write-first — KHÔNG render bảng TC ra chat · 2. Cấu trúc thư mục & ngưỡng tách file · 3. Chạy theo batch — không dừng hỏi giữa chừng · 4. File index · 5. task.md — theo dõi tiến độ

---

## Độ Hạt Test Case — GỘP / TÁCH (BẮT BUỘC chốt TRƯỚC batch đầu tiên, áp dụng QUICK · FULL RBT · DELTA)

> 📖 Nội dung đầy đủ ở [`references/granularity.md`](references/granularity.md) — **đọc khi:** QUICK · FULL RBT · DELTA — **chốt trước batch đầu tiên**.
>
> Gồm: Hai độ hạt · Hai kiểu gộp được phép · CẤM gộp — bất kể độ hạt nào đang dùng · Ràng buộc bắt buộc khi dùng GỘP · Đổi độ hạt của bộ TC đã có

---

# Mode 1: QUICK — Sinh Test Cases Nhanh

> 📖 Nội dung đầy đủ ở [`references/mode_quick.md`](references/mode_quick.md) — **đọc khi:** chạy mode QUICK.
>
> Gồm: Mục đích · Quy trình

## Khung sinh TC dùng chung (QUICK · FULL RBT · DELTA)

*(Phần **Bảng Output Standard (chuẩn hóa đầy đủ Metadata)** và các mục kế tiếp)*

> 📖 Nội dung đầy đủ ở [`references/tc_design_rules.md`](references/tc_design_rules.md) — **đọc khi:** QUICK · FULL RBT · DELTA — **trước khi viết TC đầu tiên**.
>
> Gồm: Quy Tắc Trình Bày Test Steps · Quy tắc Test Data · Bản Đồ Loại Kiểm Thử — 4 Vòng · Thứ tự bắt buộc · VÒNG 1 — SMOKE · VÒNG 2 — FUNCTIONAL · VÒNG 3 — TECHNICAL · VÒNG 4 — NON-FUNCTIONAL & REGRESSION · Độ sâu theo rủi ro — không phải chức năng nào cũng chạy đủ 4 vòng · Chấm mức rủi ro — agent tự chấm, KHÔNG hỏi user · Ba mức độ sâu · Bốn thứ KHÔNG BAO GIỜ rút, bất kể rủi ro thấp đến đâu · Trạng thái thứ tư: `⏭️` — phân biệt với `➖` · Ghi mức độ sâu vào tài liệu TC · Cách dùng — 5 quy tắc · Bảng xuất kèm output · Bảng Field-Level Validation Checklist · Bảng Component-Level Checklist · Quy Tắc Bắt Buộc Áp Dụng Kỹ Thuật Thiết Kế · Rà Soát Đặc Tính Chất Lượng — ISO/IEC 25010:2023 · Cách dùng — 3 quy tắc · Bảng xuất kèm output · Scenarios Chuyên Sâu & Non-Functional Checklist · 🛡️ AI Self-Quality Gate

---

# Mode 2: FULL RBT — Quy Trình AI-RBT 6 Bước

> 📖 Nội dung đầy đủ ở [`references/mode_full_rbt.md`](references/mode_full_rbt.md) — **đọc khi:** chạy mode FULL RBT.
>
> Gồm: Mục đích · Bước 1: Context & Role-play · Bước 2: Analysis & QnA · Bước 3: Decomposition · Bước 4: Traceability · Bước 5: RBT & TC Generation · Bước 6: Template Mapping

---

# Mode 3: CHECKLIST — Sinh Danh Sách Rà Soát Tick Tay

> 📖 Nội dung đầy đủ ở [`references/mode_checklist.md`](references/mode_checklist.md) — **đọc khi:** chạy mode CHECKLIST.
>
> Gồm: Mục đích · 2 Nguồn Input · 4 Loại Checklist & Quy Mô Khuyến Nghị · Lấy mục từ vòng nào · Quy trình · Bảng Output Standard · Cột Trạng thái & Execution ID · Mã checklist & mã mục · Quy Tắc Viết Mục Checklist · 🛡️ Checklist Quality Gate

---

# Mode 4: DELTA — Cập Nhật Bộ TC Đã Có

> 📖 Nội dung đầy đủ ở [`references/mode_delta.md`](references/mode_delta.md) — **đọc khi:** chạy mode DELTA.
>
> Gồm: Mục đích · Nguyên tắc gốc: TC ID là khoá, không phải nhãn · 5 Quy tắc bắt buộc · Bảng ánh xạ: REQ đổi gì → TC sửa gì · Tác động lan toả — 5 câu phải tự hỏi · Quality Gate DELTA

---

## Anti-Patterns (NGHIÊM CẤM — áp dụng cho cả 4 modes)

- ❌ Gộp nhiều bước chạy 1 lần trong FULL RBT (PHẢI tuần tự)
- ❌ Tự đoán business logic khi chưa hỏi user (Bước 2 - FULL RBT)
- ❌ Bỏ qua bước phân tích Ambiguity (FULL RBT)
- ❌ Sinh test data chung chung / placeholder
- ❌ Rút gọn hoặc bỏ sót test case khi mapping sang bảng
- ❌ Sinh tất cả test cases 1 lần cho hệ thống lớn (phải chia module)
- ❌ Chỉ có Happy Path, thiếu Negative/Boundary cases (QUICK)
- ❌ Test Steps mơ hồ, không ghi rõ dữ liệu nhập
- ❌ Gộp validation của **các trường khác nhau** vào 1 test case → FAIL không chỉ ra được trường nào hỏng
- ❌ Dùng chung 1 bộ validation cho tất cả fields (Email ≠ Phone ≠ Date ≠ Text)
- ❌ **Ghi dòng TC đầu tiên khi chưa chốt độ hạt GỘP/TÁCH** và chưa nêu ra chat
- ❌ Gộp mà **cắt bớt biến thể** — gộp là đổi cách trình bày, bỏ case là giảm độ phủ
- ❌ Gộp mà biến thể **không có mã riêng** (`a`, `b`, `c`…) → báo cáo FAIL không truy được về case nào
- ❌ Gộp TC `@Smoke` / `Critical`, hoặc gộp TC được thiết kế để FAIL (mỗi cái gắn 1 bug riêng)
- ❌ Gộp các biến thể **khác loại phản hồi** (trình duyệt chặn với máy chủ báo lỗi; lỗi với thành công)
- ❌ Nhồi **quá 6 biến thể** vào một TC → ô bảng không ai đọc nổi, phải tách theo nhóm rủi ro
- ❌ **Đổi độ hạt của bộ TC đã có script / execution report / RTM trỏ vào** — cắt cả ba mối nối cùng lúc. Cần gọn thì sinh checklist, giữ nguyên bộ TC
- ❌ Bỏ qua security validation (XSS, SQL injection) cho text/textarea fields
- ❌ Không liệt kê danh sách fields trước khi sinh validation TCs
- ❌ Xuất TC không có cột `REQ ID` hoặc có REQ 0 TC mà không bổ sung (vi phạm tiêu chí 6 Quality Gate)
- ❌ Test Steps viết đoạn văn liền không đánh số, hoặc gộp nhiều hành động vào 1 số
- ❌ Chỉ test form input mà bỏ qua Table/List, CRUD lifecycle, Permission, Status flow (Component-Level Checklist)
- ❌ Có ≥3 điều kiện kết hợp nhưng không lập Decision Table; có status flow nhưng không lập bảng State Transition
- ❌ QUICK mode đoán ngầm khi requirement mơ hồ mà không ghi vào mục Assumptions
- ❌ CHECKLIST mode viết mục thành test case có steps đánh số (nhầm mode — cần steps thì dùng QUICK/FULL)
- ❌ CHECKLIST mode viết mục mơ hồ kiểu "Kiểm tra chức năng hoạt động đúng" (không verify được)
- ❌ CHECKLIST mode liệt kê hết 15 loại validation cho mọi field → checklist phình to, mất tác dụng rà nhanh
- ❌ Checklist Smoke vượt 20 mục hoặc Release-readiness vượt 60 mục mà không tách module
- ❌ Xuất checklist thiếu cột `Trạng thái` / `Execution ID` hoặc thiếu bảng ký nhận (môi trường/build/người chạy)
- ❌ Ô `Trạng thái` khác `☐` mà không có `Execution ID` trỏ tới report thật — trạng thái bịa
- ❌ Sinh checklist mới trong khi đã có bộ TC chi tiết mà không rút gọn từ bộ TC đó (gây lệch nội dung)
- ❌ In toàn bộ bảng TC ra chat rồi mới ghi file (vi phạm Write-first — user chờ render 2 lần)
- ❌ Dồn >40 TC vào 1 file mà không tách part, hoặc gộp nhiều module vào 1 file
- ❌ Tách part cắt ngang giữa một nhóm chức năng (phải cắt tại ranh giới nhóm)
- ❌ Có ≥2 part nhưng không sinh file index → không đối soát được coverage toàn module
- ❌ Dừng hỏi "có tiếp tục không" sau mỗi batch (đã chốt: chạy thẳng, chỉ báo tiến độ)
- ❌ Sinh >30 TC mà không tạo `task.md` / task list → user không theo dõi được tiến độ
- ❌ **Ghi dòng TC đầu tiên khi chưa mở hết ảnh trong `evidence/`** — lỗi gốc gây bịa bố cục/nhãn/mặc định
- ❌ Viết Expected Result khẳng định chắc chắn về thứ tự Tab, vị trí phần tử, nhãn nút, định dạng hiển thị khi **không nhìn thấy trong ảnh** mà không gắn `@NeedsVerify`
- ❌ Thấy tài liệu và ảnh mâu thuẫn nhưng **tự chọn một bên rồi im lặng** — phải viết theo ảnh, ghi `ASM-XX` và báo user
- ❌ Đọc checkbox **xám mờ (disabled)** thành "không tick" — bỏ sót nguyên một business rule phụ thuộc
- ❌ Xuất bộ TC mà không kèm **Bảng Đối Soát Evidence** (tiêu chí 7 Quality Gate)
- ❌ Sinh TC cho đủ 9 ô của bảng đặc tính chất lượng — đặc tính không áp dụng thì chấm `➖` kèm lý do, TC lấp bảng là TC rác
- ❌ Chấm `➖ Ngoài phạm vi` trơn, không ghi **ai chịu trách nhiệm** — mất luôn giá trị của bảng khi đưa sang Master Test Plan mục 2.2
- ❌ **Chạy QUICK/FULL RBT trên module đã có file TC** — sinh bộ thứ hai, TC ID đánh lại từ `001`, vỡ truy vết sang automation. Đã có TC thì dùng Mode DELTA
- ❌ DELTA sinh lại cả file/module TC thay vì sửa đúng dòng bị ảnh hưởng
- ❌ DELTA đổi TC ID, đánh lại số, hoặc chèn số mới vào giữa dải đang dùng
- ❌ DELTA xoá dòng TC của chức năng bị gỡ (phải gắn tag `@Deprecated` + tiền tố `🗑️ Deprecated (<mã ticket>, <ngày>) —` ở `Test Scenario`)
- ❌ Đánh dấu Deprecated **chỉ bằng chữ** mà không gắn tag `@Deprecated` — `/execute-test-cases`, RTM và Bảng Đối Soát Coverage lọc theo tag, thiếu tag thì TC của chức năng đã gỡ vẫn bị đem ra chạy và vẫn được đếm là đang phủ REQ
- ❌ DELTA sinh file `_improved` / `_v2` / `_new` hoặc thư mục `archive/` — index có tên bất biến, bản cũ nằm trong git
- ❌ DELTA sửa tại chỗ mà **không ghi mốc git**, hoặc sửa đè lên thay đổi chưa commit
- ❌ DELTA sửa TC theo suy đoán từ tên TC, không đọc nội dung REQ sau khi đổi
- ❌ DELTA tự viết TC cho REQ mới (🟢) — ngoài phạm vi, phải route sang QUICK / FULL RBT
- ❌ DELTA bỏ qua tác động lan toả (TC dùng field ở bước phụ · TC lấy TC vừa Deprecated làm precondition)
- ❌ DELTA xong mà không ghi **Nhật ký thay đổi** và không ghi **Delta TC List** — tầng automation mất input
- ❌ **Delta TC List chỉ nằm trong chat** — tầng automation thường chạy ở phiên khác, đóng phiên là mất. Phải ghi file `impact/delta_tc_<TICKET-ID>.md`
- ❌ **Delta TC List thiếu cột Nền tảng** — dải TC ID chung toàn module nên nhìn mã không biết TC thuộc web, app hay API; automation không biết sửa ở project nào, chạy lại trên Android hay iOS
- ❌ **Bỏ TC `@NeedsVerify` khỏi Delta TC List** — automation tưởng TC không bị ảnh hưởng. Ghi dòng `⏸️ chưa sửa` để automation biết mà không chạm
- ❌ **Ghi Delta TC List ở Mode PLAN** — kế hoạch chưa duyệt có thể bị gạch bớt; automation chỉ được đọc thứ đã thật sự sửa
- ❌ **Bộ TC không có nhánh `UI cơ bản`** — không TC nào kiểm nhãn nguyên văn, thứ tự field, trạng thái mặc định của màn hình. Validation đầy đủ đến đâu cũng vẫn là thiếu hẳn một lớp
- ❌ **Nhảy cóc vòng** — sinh validation (V2) trước khi có TC mở form và lưu được (V1). V1 fail thì mọi TC V2 đều BLOCKED, chạy hết mới biết là quá muộn
- ❌ **Trộn TC của hai vòng vào một batch** — mất ranh giới chia việc và không chấm được bảng đối soát
- ❌ **Đọc lướt bảng 15 loại field rồi sinh 2–3 TC cho xong** — Password có 7 mục, Email có 9 mục; sinh 3 TC là trượt Gate #4 dù vẫn qua sàn `1 positive + 2 negative`
- ❌ **Chấm `➖` cho `UI cơ bản` / `Validation` / `Permission`** — ba nhánh này không bao giờ ngoài phạm vi khi điều kiện kích hoạt đã thoả
- ❌ **Ghi `➖` trơn không lý do, không tên người/đội chịu trách nhiệm** — biến "đã thống nhất không test" thành "QA quên test", đúng thứ bảng này sinh ra để chống
- ❌ **Hỏi lại user về quyền API / CSDL / nhật ký ở từng module** — đó là thuộc tính cấp dự án, đọc dòng `Năng lực kiểm thử của QA` ở `docs/requirements/README.md`; chưa có thì hỏi **một lần** rồi ghi vào đó ngay
- ❌ **Chạy đủ 4 vòng cho chức năng rủi ro Thấp** — bơm 50 TC cho một trang tĩnh chỉ hiển thị là lãng phí công viết, công chạy, công bảo trì, và làm loãng bộ TC thật. Chấm mức rủi ro trước, chọn độ sâu tương ứng
- ❌ **Rút gọn bằng cách bỏ Vòng 1** — V1 là thứ duy nhất trả lời "chức năng này có chạy được không". Rủi ro Thấp vẫn phải đủ 6 nhánh V1
- ❌ **Chấm `Thấp` cho chức năng có field nhập** — có ô nhập là có người nhập sai. Thiếu một trong bốn điều kiện là không được chấm Thấp
- ❌ **Dùng `➖` thay cho `⏭️`** — `➖` nghĩa là hệ thống không có thứ đó, `⏭️` nghĩa là có nhưng cố ý không kiểm. Ghi nhầm là **giấu một quyết định chấp nhận rủi ro**
- ❌ **Ghi `⏭️` mà không có điều kiện rà lại** — quyết định rút gọn phải **tự hết hạn** khi chức năng lớn lên, nếu không nó thành lỗ hổng bị quên vĩnh viễn
- ❌ **Sinh TC chỉ để lấp ô bảng 4 vòng** — TC rác làm loãng bộ TC thật, vi phạm đúng luật đã áp cho bảng ISO 25010
- ❌ **Gộp mà không công bố số biến thể** — Bảng Đối Soát Coverage đếm theo REQ nên không bắt được việc rụng biến thể
- ❌ **DELTA sửa xong Vòng 2 rồi dừng** — ticket thêm field mà chỉ sửa TC validation, quên cập nhật bảng kiểm thành phần màn hình ở `V1 · UI cơ bản`. Bộ TC thành ra mô tả một màn hình không còn tồn tại
- ❌ **DELTA rà lại toàn bộ bảng 4 vòng của cả module** — chỉ chấm lại nhánh ticket chạm tới; rà cả module là làm việc của `/generate-testcases-manual-rbt` và dễ kéo theo sửa ngoài phạm vi đã duyệt

---

## Output Format

> 📖 Nội dung đầy đủ ở [`references/output_format.md`](references/output_format.md) — **đọc khi:** mọi mode — **khi trình bày kết quả cuối**.
>
> Gồm: Mode QUICK · Mode FULL RBT · Mode CHECKLIST · Mode DELTA
