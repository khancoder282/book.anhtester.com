# Mode 3: CHECKLIST — Sinh Danh Sách Rà Soát Tick Tay

## Mục đích

Sinh **checklist ngắn gọn để tick tay** khi cần chạy nhanh — smoke trước release, bàn giao cho tester thủ công, rà soát sau hotfix. Mỗi mục là **1 dòng kiểm tra được trong vài phút**, KHÔNG phải test case có steps chi tiết.

> **Ranh giới với QUICK/FULL RBT:** Checklist trả lời "đã rà hết chưa?", test case trả lời "rà bằng cách nào?". Nếu user cần steps chi tiết, test data đầy đủ, import Jira/TestRail hay giao cho automation → dùng QUICK hoặc FULL RBT, KHÔNG dùng mode này.

## 2 Nguồn Input

Agent xác định nguồn trước khi sinh:

| Nguồn | Khi nào | Cách làm |
|---|---|---|
| **REQ-based** | Chưa có bộ TC, chỉ có requirements / UI | Rút mục checklist trực tiếp từ requirements + 3 bảng checklist chuẩn của skill |
| **TC-based** | Đã có file `TEST_CASES_<TÊN_MODULE>_SUMMARY.md` | **Rút gọn** từ bộ TC sẵn có — gom nhóm TC cùng chủ đề thành 1 mục, giữ cột `TC ID liên quan` để truy ngược |

> TC-based được ưu tiên khi bộ TC đã tồn tại — tránh sinh lại nội dung lệch với bộ TC gốc.

## 4 Loại Checklist & Quy Mô Khuyến Nghị

Agent **BẮT BUỘC** hỏi hoặc suy ra loại checklist, vì nó quyết định độ sâu và số mục:

| Loại | Mục đích | Số mục | Thời gian chạy tay |
|---|---|---|---|
| **Smoke** | Xác nhận build chạy được, luồng sống còn không vỡ | 10–20 | ≤ 15 phút |
| **Post-hotfix** | Rà vùng ảnh hưởng của bản vá + vùng lân cận | 5–15 | ≤ 10 phút |
| **Regression (module)** | Rà toàn bộ 1 module trước khi bàn giao | 20–40 | ≤ 45 phút |
| **Release-readiness** | Rà toàn hệ thống trước khi lên production | 30–60 | ≤ 60 phút |

> Vượt ngưỡng số mục → agent PHẢI tách theo module hoặc hạ scope, KHÔNG xuất checklist dài lê thê (mất tác dụng "rà nhanh").

### Lấy mục từ vòng nào

Checklist **không** chấm bảng đối soát 4 vòng (Gate #10 không áp dụng cho mode này), nhưng vẫn **lấy mục theo vòng** để biết dừng ở đâu:

| Loại checklist | Lấy mục từ | Bỏ qua |
|---|---|---|
| **Smoke** | **Chỉ V1** — UI cơ bản · mở form · hiển thị · nhập hợp lệ · lưu · đối chiếu dữ liệu | Toàn bộ V2–V4 |
| **Post-hotfix** | V1 của vùng vá + nhánh V2 mà bản vá chạm tới | V3 · V4 |
| **Regression (module)** | V1 + V2 đầy đủ + nhánh V3 `Permission` | V4 (trừ `Regression` nếu module có bug cũ) |
| **Release-readiness** | V1 + nhánh sống còn của V2 + `Permission`/`Security` (V3) + `E2E` (V4) | Phần còn lại của V3 · V4 |

> Checklist Smoke mà có mục validation biên hay bảng quyết định là **sai loại** — đó là V2, thuộc bộ TC chi tiết. Smoke chỉ trả lời *"build này có dùng được không"*.

## Quy trình (1 lượt duy nhất)

**Agent phải:**

0. **Mở evidence** theo [Quy Tắc Đối Chiếu Evidence](#quy-tắc-đối-chiếu-evidence-bắt-buộc--áp-dụng-cả-4-modes-chạy-trước-batch-đầu-tiên) — checklist nêu **nhãn nút và dấu hiệu quan sát được trên UI**, sai một chữ là người chạy tick nhầm. Nguồn TC-based thì evidence đã được đối chiếu ở bước sinh TC, chỉ cần mở lại ảnh của màn hình có trong checklist
1. **Xác định loại checklist** (Smoke / Post-hotfix / Regression / Release-readiness) và **nguồn input** (REQ-based hay TC-based)
2. **Xác định scope:** module nào, luồng nào, role nào. Với Post-hotfix → xác định rõ **vùng ảnh hưởng** của thay đổi + vùng lân cận có rủi ro
3. **Rút mục từ 3 bảng checklist chuẩn của skill** — chỉ lấy mục **thực sự áp dụng** cho module:
   - **Field-Level Validation (15 loại field):** với checklist chỉ lấy **1–2 mục đại diện rủi ro cao nhất** cho mỗi field quan trọng (KHÔNG liệt kê hết mọi validation — đó là việc của QUICK/FULL)
   - **Component-Level:** Data Table/List, CRUD Lifecycle, Permission/Role, Modal/Dialog, Notification, Status Flow
   - **Non-Functional:** Race condition/Double submit, Session/Network, Localization/UTF-8, A11y bàn phím
4. **Ưu tiên theo rủi ro:** luồng liên quan tiền, phân quyền, mất dữ liệu → luôn nằm trong checklist dù loại nào
5. **Viết mỗi mục theo Quy Tắc Viết Mục Checklist** (bên dưới)
6. **Gắn metadata:** `Priority` (P1/P2/P3), `REQ ID` (nếu có), `TC ID liên quan` (nếu TC-based)
6b. **Gắn trạng thái từ execution đã có** — quét `docs/executions/<module>/<nền-tảng>/run_*/execution_report.md`, điền cột `Trạng thái` + `Execution ID` theo [Cột Trạng thái & Execution ID](#cột-trạng-thái--execution-id) bên dưới. Chưa có kết quả → `☐` / `—`
7. **Nhóm mục theo Module → Nhóm chức năng**, đánh số liên tục để dễ đối chiếu khi báo cáo
8. **Ghi `Mã checklist`** ở header — xem [Mã checklist & mã mục](#mã-checklist--mã-mục) bên dưới
9. **Chạy Checklist Quality Gate (5 tiêu chí)** trước khi xuất

## Bảng Output Standard

```markdown
## [Tên Module] — Checklist <Loại> (<số mục> mục · ~<thời gian> phút)

**Mã checklist:** `CL-smoke_20261009`
**Trạng thái lấy từ:** 1/2 mục đã có kết quả — lần chạy bộ TC `run_1787215085` (chưa có lần chạy nào của chính checklist này)

### Nhóm: <Tên nhóm chức năng>

| # | Trạng thái | Hạng mục kiểm tra | Kết quả kỳ vọng | Priority | REQ ID | TC ID liên quan | Execution ID |
|---|---|---|---|---|---|---|---|
| 1 | ✅ PASS | Đăng nhập bằng tài khoản admin hợp lệ | Vào /dashboard, hiển thị tên user góc phải | P1 | REQ-LOGIN-01 | CRM_LOGIN_TC_001 | [run_1787215085](../../../executions/login/web/run_1787215085/execution_report.md)<br><sub>20-08-2026</sub> |
| 2 | ☐ | Đăng nhập sai mật khẩu 5 lần liên tiếp | Tài khoản bị khóa, hiện thông báo khóa | P1 | REQ-LOGIN-02 | CRM_LOGIN_TC_012 | — |
```

**Kết thúc checklist BẮT BUỘC kèm bảng ký nhận:**

```markdown
| Môi trường | Build / Version | Người thực hiện | Ngày | Kết quả (Pass/Fail/Blocked) |
|---|---|---|---|---|
|  |  |  |  |  |
```

> Cột `TC ID liên quan` ghi `—` khi checklist là REQ-based.
>
> **Checklist Release-readiness** cắt ngang nhiều module → thêm cột **`Module`** (tên thư mục module, VD `customers`) ngay sau `Hạng mục kiểm tra`. Lần chạy, bug và RTM phía sau dựa vào cột này để quy mỗi mục về đúng module — thiếu cột là bug sinh ra không biết đặt vào `docs/bugs/<module>/`.

### Cột Trạng thái & Execution ID

Checklist sinh ra **không** để trống mù: mục nào đã có kết quả chạy thì gắn luôn, người đọc biết ngay mục nào còn phải chạy.

| Trường hợp | `Trạng thái` | `Execution ID` |
|---|---|---|
| Chưa có kết quả | `☐` — người chạy tay tự đánh dấu | `—` |
| Có kết quả | Đúng nhãn của execution report: `✅ PASS` · `❌ FAIL` · `⚠️ BLOCKED` · `⏭️ SKIPPED` | `[<run_id>](<link tương đối tới execution_report.md>)<br><sub><ngày chạy DD-MM-YYYY></sub>` — ngày lấy ở ô `Bắt đầu → Kết thúc` của report, chữ nhỏ dưới ID |

**Nguồn kết quả — xét theo thứ tự, gặp nguồn nào có thì dừng:**

| # | Nguồn | Áp dụng | Cách lấy |
|---|---|---|---|
| 1 | Lần chạy **chính checklist này** — report có `Loại nguồn` = `Checklist <loại> · <Mã checklist>` | Mọi checklist | Khớp theo **mã mục** `<Mã checklist>-<nn>`, lấy lần chạy mới nhất |
| 2 | Lần chạy **bộ TC** cùng module + nền tảng — report có `Loại nguồn` = `Bộ TC` (report cũ không có ô này coi là `Bộ TC`) | Chỉ TC-based | Theo từng `TC ID liên quan` — xem luật gộp bên dưới |

Checklist **khác** (khác `Mã checklist`) **không** là nguồn — phạm vi mục khác nhau, mượn kết quả là sai nghĩa. Checklist REQ-based chỉ có nguồn 1.

**Luật gộp khi lấy từ bộ TC (nguồn 2):**

- Mỗi TC lấy **lần chạy mới nhất có kết quả khác `SKIPPED`** — lần sau bổ sung cho lần trước bị skip. Chỉ từng có `SKIPPED` → `⏭️ SKIPPED`
- Mục gắn nhiều TC → lấy mức **xấu nhất**: `FAIL` > `BLOCKED` > `SKIPPED` > `PASS`. `✅ PASS` **chỉ** khi **mọi** TC liên quan đều PASS
- Có TC liên quan **chưa từng chạy** mà các TC còn lại đều PASS → để `☐` — chưa đủ bằng chứng để nói mục đạt. Có TC đã FAIL/BLOCKED thì vẫn hiện mức đó
- `Execution ID` = lần chạy chứa kết quả **quyết định** trạng thái (mức xấu nhất; bằng nhau → lần mới nhất). Chỉ ghi **một** ID mỗi mục
- Link tương đối từ file checklist: `../../../executions/<module>/<nền-tảng>/<run_id>/execution_report.md` (checklist `_release/` cùng độ sâu)

**Header ghi dòng `Trạng thái lấy từ:`** — `<số mục có kết quả>/<tổng> mục đã có kết quả` + nguồn nào, các `run_id` nào. Không có gì → `Chưa có lần chạy nào`.

- 🚫 Agent **không** tự chấm trạng thái khi chưa chạy — mọi ô khác `☐` phải truy được về đúng một execution report
- Trạng thái mượn từ bộ TC chỉ là **bản sao để đọc** — báo cáo tổng hợp, RTM vẫn đọc kết quả từ execution report, không đọc cột này, nên không đếm hai lần
- Chạy checklist xong, `/execute-test-cases` cập nhật lại **đúng hai cột này** + dòng `Trạng thái lấy từ:` (nguồn 1 thay nguồn 2) — không đụng cột khác, không đụng bảng ký nhận

### Mã checklist & mã mục

Cột `#` chỉ là số thứ tự **trong một file** — mục `#3` của checklist smoke và mục `#3` của checklist regression là hai việc khác nhau. Khi kết quả đi sang execution report, bug, RTM và báo cáo tổng hợp, mỗi mục phải có mã **không trùng giữa các checklist**:

| | Quy tắc | Ví dụ |
|---|---|---|
| **Mã checklist** | `CL-` + phần tên file **sau** `checklist_`, bỏ `.md` — giữ nguyên chữ thường và dấu | `checklist_smoke_20261009.md` → `CL-smoke_20261009` · `checklist_post-hotfix_CRM-812.md` → `CL-post-hotfix_CRM-812` · `checklist_release_release_2.0.md` → `CL-release_release_2.0` |
| **Mã mục** | `<Mã checklist>-<số mục 2 chữ số>` | mục 3 → `CL-smoke_20261009-03` |

- Mã mục **không** ghi vào bảng checklist (bảng giữ cột `#` cho người tick tay) — `/execute-test-cases` tự ghép khi ghi report
- Mã mục **không phải** TC ID và **không** thay TC ID: mục có `TC ID liên quan` thì mọi mắt xích phía sau vẫn truy về TC đó
- Không dùng `#` trong mã — `#` vỡ link Markdown và tên file bug

## Quy Tắc Viết Mục Checklist (BẮT BUỘC)

- **Mỗi mục 1 dòng, ≤ 20 từ**, bắt đầu bằng **động từ** (Đăng nhập, Tạo, Sửa, Xóa, Lọc, Xuất...)
- **Verify được trong ≤ 2 phút** bởi người chưa đọc requirements
- **Có kết quả kỳ vọng quan sát được** — không viết "hoạt động đúng", phải nêu dấu hiệu cụ thể trên UI
- **Test data cụ thể ở mục phụ thuộc data** (áp dụng nguyên Quy tắc Test Data của skill)
- **KHÔNG viết steps đánh số** — nếu một mục cần >3 thao tác mới verify được thì nó là test case, phải tách hoặc chuyển sang mode QUICK

```markdown
❌ Sai: "Kiểm tra chức năng khách hàng hoạt động tốt"
✅ Đúng: "Tạo KH mới với đủ field bắt buộc → xuất hiện đầu danh sách, đúng tên vừa nhập"

❌ Sai: "Test phân quyền"
✅ Đúng: "Đăng nhập role Sale, mở URL /admin/settings trực tiếp → bị chặn, về trang 403"

❌ Sai: "Kiểm tra validate email"
✅ Đúng: "Nhập email thiếu @ (`test.domain.com`) → hiện lỗi 'Email không hợp lệ', không submit"
```

## 🛡️ Checklist Quality Gate (5 Tiêu Chí)

Trước khi xuất, agent **BẮT BUỘC** tự rà:

- [ ] **1. Verify được:** 100% mục có kết quả kỳ vọng quan sát được, không còn từ "hoạt động đúng / bình thường / OK"
- [ ] **2. Critical path đủ:** Mọi luồng sống còn của module (đăng nhập, tạo/sửa/xóa bản ghi chính, phân quyền, thanh toán nếu có) đều có ≥1 mục P1
- [ ] **3. Component đủ:** Mỗi component có mặt trong module (Table/List, CRUD, Permission, Modal, Notification, Status Flow) có ≥1 mục — component không có trong module thì ghi "Không áp dụng", KHÔNG lặng lẽ bỏ qua
- [ ] **4. Đúng quy mô:** Số mục nằm trong ngưỡng của loại checklist. Vượt ngưỡng → tách theo module hoặc hạ scope, ghi rõ phần đã cắt
- [ ] **5. Truy vết được:** Header có `Mã checklist` khớp tên file · mục có REQ thì điền `REQ ID` · TC-based thì điền `TC ID liên quan` · Release-readiness có cột `Module` ở **mọi** mục · ô `Trạng thái` khác `☐` đều có `Execution ID` mở được đúng report
