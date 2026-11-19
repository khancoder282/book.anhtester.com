---
name: skills-quality-insights
description: Skill phân tích chất lượng cắt ngang toàn dự án từ dữ liệu đã có trong docs/ — xu hướng lỗi và vấn đề lặp lại (gom nhóm nguyên nhân gốc trên kho bug + lịch sử chạy), chấm rủi ro release theo module × nền tảng (thay đổi · lỗi mở · bất ổn · khoảng trống thực thi · tầm ảnh hưởng), và chọn + xếp hạng test cho một thay đổi trong quỹ thời gian có hạn (test impact analysis). Mọi con số truy về mã bug · run · TC · REQ; điểm số minh bạch, không mô hình hộp đen. Dùng khi QA Lead hỏi "lỗi đang dồn vào đâu", "release này rủi ro ở module nào", "có 1 giờ thì chạy TC nào trước".
user-invocable: false
---

# Quality Insights

Purpose: Trả lời ba câu hỏi mà từng báo cáo riêng lẻ không trả lời được, vì chúng cần **đọc chéo** bug × lần chạy × test case × thay đổi:

| Câu hỏi | Workflow | Đầu ra |
|---|---|---|
| *"Lỗi đang dồn vào đâu, có vấn đề nào lặp lại không?"* | `/analyze-defect-trends` | `docs/quality-insights/defect_trends_<YYYYMMDD>.md` |
| *"Release này rủi ro ở module × nền tảng nào, vì sao?"* | `/assess-release-risk` | `docs/quality-insights/release_risk_<mốc>_<YYYYMMDD>.md` |
| *"Thay đổi này, quỹ X phút — chạy TC nào, theo thứ tự nào, cố ý bỏ gì?"* | `/select-regression-tests` | `docs/quality-insights/test_selection_<TICKET-ID \| mốc>_<YYYYMMDD>.md` |

Số liệu do **`scripts/quality-insights/qi.py`** tính — đọc thẳng `docs/`, không cần nguồn ngoài. Phần **AI** là việc của agent: đọc file nguồn để gom nhóm nguyên nhân gốc, đối chiếu điểm số với bối cảnh (ticket, plan, AMB), và viết nhận định có căn cứ — **không** phải sinh số.

---

## When to Use

- Họp triage / retro cần biết lỗi dồn vào module, nền tảng, loại nguyên nhân nào
- Trước mốc release: cần danh sách vùng nóng để dồn lực kiểm thử, hoặc làm căn cứ cho phần *Rủi ro còn lại* của báo cáo tổng hợp
- Có ticket / Impact Report mới mà không đủ thời gian chạy lại cả bộ
- Build mới về, cần chọn regression nhanh trong 30–60 phút

### Ranh giới với các skill gần giống

| Skill | Phạm vi | Trả lời |
|---|---|---|
| `skills-test-report-analyzer` | **Một** lần chạy (± so lần trước của cùng nguồn) | Vì sao lần chạy này fail |
| `skills-test-progress-reporter` | **Một kỳ** trong đợt | Có kịp tiến độ không |
| `skills-test-summary-reporter` | **Cả đợt**, tại mốc | Có release được không (go/no-go) |
| `skills-rbt-manual-testing` | **Một module**, lúc thiết kế TC | Rủi ro *thiết kế* → độ sâu TC |
| **Skill này** | **Cắt ngang** mọi module × nền tảng × thời gian | Lỗi lặp ở đâu · vùng nào nóng · chạy gì trước |

> ⛔ Skill này **không** khuyến nghị go/no-go — đó là việc của `/generate-test-summary-report`. Báo cáo rủi ro release là **đầu vào** cho báo cáo đó, không thay thế.

---

## Nguyên tắc gốc

| # | Nguyên tắc | Vì sao |
|---|---|---|
| 1 | **Mọi con số truy về nguồn** — mã bug, Run ID, TC ID, REQ ID, mã ticket. Bảng số lấy nguyên từ `qi.py`, không gõ tay | Báo cáo phân tích bị đọc để ra quyết định cắt phạm vi; con số không truy được là con số không ai dám dùng |
| 2 | **Thiếu dữ liệu ≠ an toàn.** Đơn vị chưa chạy lần nào, chưa có TC → tính là **có rủi ro** và đánh dấu ⬛ | Module không ai test thì 0 bug — đọc "0 bug" là "ổn" là sai lầm kinh điển |
| 3 | **Tôn trọng cỡ mẫu.** Dưới 5 lỗi thật hoặc dưới 3 mốc thời gian → gọi là *quan sát*, **không** gọi là *xu hướng*, không ngoại suy | 5 bug không vẽ ra được đường xu hướng; nói "lỗi đang giảm" từ 3 điểm là bịa |
| 4 | **Điểm số minh bạch.** Mỗi điểm rủi ro / điểm chọn TC hiện đủ thành phần (`+40 trỏ REQ đổi · +15 Risk High …`). Thang và trọng số ở [`references/scoring.md`](references/scoring.md) | Người đọc phải cãi được với con số. Điểm hộp đen thì không ai sửa được khi nó sai |
| 5 | **Không tự sửa file nguồn.** Không đổi trạng thái bug, không sửa TC, không ghi nhóm nguyên nhân ngược vào file bug | Báo cáo này là **ảnh chụp phân tích**. Việc cần làm trên nguồn → ghi ở mục *Đề xuất hành động* kèm workflow, user tự gọi |
| 6 | **Nền tảng tách riêng.** Đơn vị phân tích là `module × nền tảng` (`web` · `mobile` · `api`), hệ thống thứ hai (`_<hệ-thống>/`) ghi rõ namespace | Lỗi Android không làm web rủi ro hơn; gộp lại là che mất lỗi đặc thù nền tảng |
| 7 | **FAIL không phải lúc nào cũng là lỗi app.** TC fail chưa có bug → đọc mục *Chi tiết TC FAIL* của execution report, phân loại *lỗi app* / *TC sai* / *môi trường* trước khi gọi là "lỗi rò rỉ" | Đếm TC viết sai thành lỗi sản phẩm là thổi phồng rủi ro và đổ oan cho dev |

---

## Công cụ — `qi.py`

```bash
python scripts/quality-insights/qi.py collect -o reports/quality-insights/<run>/data                 # dữ liệu thô — soát parser
python scripts/quality-insights/qi.py trends  [--modules …] [--system …] -o reports/quality-insights/<run>/trends
python scripts/quality-insights/qi.py risk    [--ticket A,B | --since DD-MM-YYYY] [--modules …] -o …/risk
python scripts/quality-insights/qi.py select  --ticket <ID> | --req REQ-…,REQ-… | --modules …  [--platform web] [--budget 45] -o …/select
```

| Nguồn | Script đọc gì |
|---|---|
| `docs/bugs/**/BUG_*.md` | Severity · trạng thái (file bug, rơi về danh mục) · `Test case liên quan` · `REQ ID liên quan` / `Requirement` (mã **đầu ô** là REQ chính) · `Ngày phát hiện` · bảng `Lịch sử retest` · dòng `Nghi ngờ root cause` |
| `docs/executions/**/run_*/execution_report.md` | Bảng có cột `TC ID` + `Kết quả` · `Loại nguồn` · `Bắt đầu → Kết thúc` (thời lượng → phút/TC) |
| `docs/testcases/**/<web\|mobile\|api>/**/*.md` | Bảng TC: `REQ ID` · `Risk Level` · `Priority` · `Tags` (`@Smoke` · `@CriticalPath` · `@Deprecated` · `@PersonalOnly` · `@KnownBug`) |
| `docs/requirements/**/impact/impact_<TICKET>.md` | Mục `## Tóm tắt`: dòng 🟢 Thêm · 🟡 Sửa · 🔴 Bỏ |

**Bắt buộc soát parser trước khi tin số:** chạy `collect`, so số bug / run / TC với danh mục (`docs/bugs/README.md`, `docs/testcases/README.md`). Lệch → tìm file bị bỏ sót (định dạng cũ, cột đổi tên) và ghi vào mục *Giới hạn dữ liệu* của báo cáo; **không** lấp số bằng tay.

File làm việc (`data.json`, `*.md`/`*.json` thô) để ở `reports/quality-insights/<run>/` — đã `.gitignore`. Báo cáo cuối ở `docs/quality-insights/`.

---

## 1. Xu hướng lỗi & vấn đề lặp lại

### 1.1 Script cho gì — agent làm gì

| `qi.py trends` (máy) | Agent (đọc file nguồn) |
|---|---|
| A. Lỗi theo đơn vị: severity · đang mở · **điểm mở** · tuổi · NOT_FIXED | **Gom nhóm nguyên nhân gốc** — gán mỗi lỗi **một** loại ở 1.2, căn cứ trích từ file bug |
| B. Lỗi theo tháng phát hiện | Nhận định xu hướng — **chỉ khi** qua ngưỡng cỡ mẫu |
| C. Danh sách lỗi + gợi ý nguyên nhân trích file bug | Tìm **vấn đề hệ thống**: cùng loại nguyên nhân ở ≥ 2 lỗi, ≥ 2 module hoặc cùng dấu hiệu (cùng thông báo lỗi, cùng màn hình thao tác) |
| D. Cụm lỗi cùng REQ chính | Đối chiếu cụm với `RISK-<MODULE>-nn` trong requirements — rủi ro đã dự báo có thành lỗi thật không |
| E. Xu hướng từng TC: 🆕 mới fail · 🔁 liên tục · 🎲 lật · ✅ hết fail · ⚠️ sang BLOCKED | Phân loại TC FAIL **chưa có bug**: lỗi app / TC sai / môi trường — đọc mục *Chi tiết TC FAIL* của run |
| F. TC fail chưa có bug · bug mở mà TC đã PASS | Đề xuất workflow cho từng việc |

### 1.2 Bảng loại nguyên nhân gốc

Gán **một** loại chính cho mỗi lỗi. Không chắc → loại gần nhất + `(?)` + câu hỏi cho dev ở mục đề xuất. **Không** sáng tác nguyên nhân không có trong file bug.

| Mã | Nghĩa | Dấu hiệu trong file bug |
|---|---|---|
| `VALIDATION` | Thiếu / sai kiểm tra dữ liệu nhập | Bỏ trống, quá dài, sai định dạng mà hệ thống không chặn hoặc chặn sai |
| `LOGIC` | Sai quy tắc nghiệp vụ, tính toán | Kết quả sai dù nhập đúng |
| `ERROR-HANDLING` | Thông báo lỗi sai bản chất / rỗng / chung chung, nuốt lỗi | `Error in processing request`, thông báo chỉ có `!`, báo "không tồn tại" cho ô trống |
| `STATE` | Không giữ / không reset dữ liệu, phiên, bộ nhớ đệm | Ô mất giá trị sau lỗi, ô không xoá sau gửi, phiên lạc |
| `INTEGRATION` | Client ↔ server / dịch vụ ngoài hỏng | Gửi đi không lưu, request lỗi, web làm được mà app không |
| `PLATFORM` | Chỉ hỏng trên **một** nền tảng, nền tảng khác cùng nghiệp vụ chạy đúng | File bug ghi *"Web làm được với cùng dữ liệu"* |
| `SECURITY-CONFIG` | Cấu hình bảo mật | HTTPS, HSTS, cookie, header |
| `UI` | Hiển thị, bố cục, điều hướng | Sai chỗ, sai đích liên kết |
| `REQ-GAP` | Yêu cầu thiếu / mơ hồ / tranh cãi | Bug kết thúc ⚪ *không phải lỗi*, hoặc file bug đề xuất *"xác nhận lại với PO"* |
| `TEST-ISSUE` | TC / dữ liệu / môi trường sai — **không** phải lỗi app | Chỉ dùng cho TC FAIL chưa có bug ở mục F |

> `PLATFORM` và `INTEGRATION` hay đi cùng nhau. Chọn `PLATFORM` khi **cùng thao tác trên nền tảng khác chạy đúng** — đó mới là thông tin dev cần để khoanh vùng.

### 1.3 Ngưỡng gọi tên

| Gọi là | Điều kiện tối thiểu |
|---|---|
| **Vấn đề lặp lại** | Cùng loại nguyên nhân ở ≥ 2 lỗi **và** (≥ 2 module **hoặc** ≥ 2 màn hình **hoặc** cùng dấu hiệu nguyên văn) |
| **Xu hướng tăng / giảm** | ≥ 5 lỗi thật **và** ≥ 3 mốc thời gian có dữ liệu. Dưới ngưỡng → *"chưa đủ dữ liệu"* |
| **Điểm nóng** | Đơn vị có điểm mở cao nhất **và** ≥ 1 lỗi Critical/Major, hoặc ≥ 2 TC 🔁 fail liên tục |
| **Lỗi già** | Lỗi mở ≥ 30 ngày, hoặc ≥ 1 lần retest NOT_FIXED |

---

## 2. Rủi ro release theo module × nền tảng

### 2.1 Năm yếu tố — mỗi yếu tố 0–3

| Mã | Yếu tố | Thuộc | Nguồn |
|---|---|---|---|
| **C** | Thay đổi — số REQ thêm / sửa / bỏ trong phạm vi release | Khả năng | Impact report (`--ticket` / `--since`) |
| **D** | Lỗi đang mở — điểm theo trọng số severity; có Critical → 3 | Khả năng | `docs/bugs/` |
| **I** | Bất ổn — tỉ lệ fail ở kết quả gần nhất, mới fail, lật | Khả năng | `docs/executions/` |
| **G** | Khoảng trống thực thi — % TC chưa chạy lần nào; REQ đổi chưa có TC | Khả năng | TC × run |
| **B** | Tầm ảnh hưởng — % TC chấm High/Critical ở RBT | Tác động | `Risk Level` của TC |

`Khả năng = 1 + (C+D+I+G)/12 × 4` · `Tác động = 1 + B/3 × 4` · `Điểm = Khả năng × Tác động` (1–25) — cùng khung *khả năng × tác động* của RBT. 🔴 Cao ≥ 15 · 🟠 Trung bình 8–14,9 · 🟢 Thấp < 8. Còn lỗi Critical mở, hoặc đơn vị **chưa có TC nào** → **ít nhất 🔴**. Ngưỡng từng yếu tố: [`references/scoring.md`](references/scoring.md).

### 2.2 Việc của agent sau khi có bảng điểm

1. **Đặt đúng phạm vi release**: có `docs/test-plans/test_plan_<mốc>.md` → lấy module trong phạm vi (mục 2.1 của plan) → `--modules`, ticket thuộc đợt → `--ticket`. Không có plan → hỏi user mốc và ticket; không có ticket → `--since <ngày bắt đầu đợt>`. Chạy **không** giới hạn thì C cộng dồn mọi impact report từ trước tới nay — ghi rõ điều đó nếu buộc phải làm vậy
2. **Đối chiếu từng 🔴** với bối cảnh: REQ đổi chưa có TC có phải REQ **cố ý ngoài phạm vi** không (đọc *Tóm tắt* của impact report); lỗi Critical có đang được dev sửa không
3. **Nối với rủi ro đã công bố**: `RISK-<MODULE>-nn` ở requirements / mục 8.2 của plan — rủi ro đã thành hiện thực (có lỗi) hay chưa có bằng chứng
4. **Đề xuất kiểm soát** cho từng đơn vị 🔴 / 🟠: chạy gì (`/select-regression-tests`), retest gì (`/retest-fixed-bugs`), chạy TC chưa chạy (`/execute-test-cases`), bổ sung TC (`/update-testcases-from-impact`)
5. **Không** tự đổi điểm. Thấy điểm sai so với thực tế → giữ điểm máy, ghi *"Nhận định QA: … vì …"* bên cạnh — người đọc thấy cả hai

---

## 3. Chọn & xếp hạng test cho một thay đổi

### 3.1 Ba nhóm

| Nhóm | Vào khi | Cắt được khi thiếu thời gian? |
|---|---|---|
| **Bắt buộc** | TC trỏ thẳng REQ đổi · TC **mới fail** ở lần chạy gần nhất · TC có bug **đã fix chờ retest** | ❌ Không — vượt quỹ thì **báo QA Lead xin thêm thời gian** |
| **Smoke** | `@Smoke` của module có thay đổi | Hạn chế — cắt thì ghi rõ |
| **Theo điểm** | Còn lại trong module có thay đổi, xếp theo điểm | ✅ Phần ngoài quỹ → **⏭️ Cố ý bỏ**, liệt kê đủ |

TC trỏ REQ đổi nhưng **bug còn mở, dev chưa sửa, lần trước FAIL** → hạ xuống *Theo điểm* (−15): chạy lại chỉ xác nhận điều đã biết. `@Deprecated` loại hẳn · `@PersonalOnly` tách danh sách *QA tự chạy*.

### 3.2 Điểm

`+40` trỏ REQ đổi (`+10` nếu chỉ cùng module) · Risk Level `Critical 20 / High 15 / Medium 8 / Low 3` · Priority `Critical 15 / High 10 / Medium 5 / Low 2` · `+10` `@Smoke` · `+10` `@CriticalPath` · `+10` chưa chạy lần nào · `+20` mới fail · `+10` lật PASS↔FAIL · `+8` lần gần nhất BLOCKED · `+25` bug đã fix chờ retest · `−15` bug mở chưa fix mà lần trước FAIL.

Thời lượng/TC lấy **trung bình phút/TC** các lần chạy trước của cùng module × nền tảng; chưa có lần chạy → 4 phút/TC (ghi rõ là ước tính).

### 3.3 Việc của agent

1. Xác định thay đổi: `--ticket` (có impact report) · `--req` (user liệt kê) · hoặc đọc ticket rồi tự quy về REQ — **ghi căn cứ** từng REQ
2. **Mở rộng theo phụ thuộc**: đọc `system_map.md` (phụ thuộc giữa module) + `RISK-*` kiểu *"sau mỗi lần sửa X chạy kèm smoke module phụ thuộc"* → thêm `--modules` cho module phụ thuộc. Script không biết phụ thuộc — agent phải thêm
3. REQ đổi **chưa có TC** → không chọn được gì → dừng mục đó, đề xuất `/update-testcases-from-impact` **trước** khi chạy
4. Xuất danh sách **có thứ tự** + **⏭️ Cố ý bỏ** kèm lý do — đúng tinh thần `⏭️` của RBT: bỏ là **một quyết định có người chịu trách nhiệm**, ghi ai duyệt
5. Danh sách đã chọn dùng thẳng làm phạm vi của `/execute-test-cases` (mỗi TC ID một dòng)

---

## 4. Mẫu báo cáo

Ba báo cáo chung khung — khác ở mục 2:

```markdown
# <Xu hướng lỗi | Rủi ro release <mốc> | Chọn test <TICKET>> — <Hệ thống>

| Mục | Giá trị |
|---|---|
| Ngày lập | DD-MM-YYYY |
| Phạm vi | <hệ thống · module · nền tảng> |
| Nguồn dữ liệu | <n> bug · <n> lần chạy · <n> TC · <n> impact report — `qi.py <lệnh> <tham số>` |
| Giới hạn dữ liệu | <cỡ mẫu, nguồn thiếu, file parser bỏ sót — hoặc "Không"> |

## 1. Kết luận chính
3–5 gạch đầu dòng, mỗi dòng một phát hiện + số + mã nguồn. Không lời bình chung chung.

## 2. <Phần riêng>
- Xu hướng lỗi: Bảng nhóm nguyên nhân gốc (loại · số lỗi · mã bug · căn cứ) → Vấn đề lặp lại → Điểm nóng → bảng A–G của qi.py
- Rủi ro release: Bảng điểm qi.py → Nhận định QA cho từng 🔴/🟠 → Rủi ro đã công bố đã thành hiện thực chưa
- Chọn test: Thay đổi & REQ → Thứ tự chạy → REQ chưa phủ → ⏭️ Cố ý bỏ (người duyệt: ❓)

## 3. Đề xuất hành động
| # | Việc | Đối tượng (mã) | Command | Ưu tiên |

## 4. Phương pháp
Thang điểm: `.claude/skills/skills-quality-insights/references/scoring.md` · ngưỡng cỡ mẫu · những gì báo cáo KHÔNG nói
```

---

## Anti-Patterns (NGHIÊM CẤM)

| ❌ | ✅ |
|---|---|
| Gõ tay hoặc làm tròn lại số của `qi.py` | Dán nguyên bảng; nhận định viết bên ngoài bảng |
| *"Lỗi đang giảm"* từ 2–3 điểm dữ liệu | *"Chưa đủ dữ liệu để gọi xu hướng (5 lỗi, 2 tháng)"* |
| Đơn vị không có lần chạy được xếp 🟢 vì 0 lỗi | ⬛ thiếu dữ liệu, tính như có rủi ro |
| Gán nguyên nhân gốc không có trong file bug | Trích căn cứ; không có → `(?)` + câu hỏi cho dev |
| Gọi mọi TC FAIL chưa có bug là "lỗi rò rỉ" | Đọc chi tiết FAIL, phân loại lỗi app / TC sai / môi trường |
| Tự đổi trạng thái bug, sửa TC, thêm cột vào file bug | Ghi đề xuất + workflow, user tự chạy |
| Cắt TC nhóm *Bắt buộc* cho vừa quỹ thời gian | Báo vượt quỹ, xin thêm thời gian |
| Khuyến nghị go/no-go | Đưa bảng rủi ro sang `/generate-test-summary-report` |
| Gộp web + mobile của một module làm một đơn vị | Tách `module × nền tảng` |
| Dữ liệu khách hàng / credentials trong báo cáo | Chỉ mã bug, TC, REQ; trích dẫn ngắn đã che |

---

## Quality Checklist

- [ ] Đã chạy `collect` và đối chiếu số bug / run / TC với danh mục — lệch thì đã ghi *Giới hạn dữ liệu*
- [ ] Mỗi con số có mã nguồn đi kèm
- [ ] Đã ghi rõ phạm vi (hệ thống, module, nền tảng, ticket / mốc / `--since`)
- [ ] Cảnh báo cỡ mẫu của `qi.py` được giữ ở đầu báo cáo, không xoá
- [ ] Xu hướng lỗi: mỗi lỗi một loại nguyên nhân + căn cứ trích file bug
- [ ] Xu hướng lỗi: TC FAIL chưa có bug đã phân loại lỗi app / TC sai / môi trường
- [ ] Rủi ro: đơn vị ⬛ không bị diễn giải là an toàn; mỗi 🔴 có nhận định QA và đề xuất kiểm soát
- [ ] Chọn test: đã mở rộng theo module phụ thuộc; REQ chưa có TC đã nêu; danh sách ⏭️ đủ, có ô người duyệt
- [ ] Không file nguồn nào bị sửa
- [ ] Ngày trong nội dung viết DD-MM-YYYY; link tương đối mở được từ `docs/quality-insights/`

## Rules References

- [`.claude/rules/automation_rules.md`](../../rules/automation_rules.md) — test data, độc lập test (khi chọn TC automation)
- [`skills-rbt-manual-testing`](../skills-rbt-manual-testing/SKILL.md) — `Risk Level`, ý nghĩa `⏭️ Cố ý bỏ`
- [`skills-test-report-analyzer`](../skills-test-report-analyzer/SKILL.md) — phân loại failure của một lần chạy
- [`skills-test-summary-reporter`](../skills-test-summary-reporter/SKILL.md) — nơi dùng bảng rủi ro để kết luận go/no-go
