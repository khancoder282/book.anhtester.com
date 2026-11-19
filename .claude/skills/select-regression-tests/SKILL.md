---
name: select-regression-tests
description: Chọn và xếp hạng test case cho một thay đổi (ticket / Impact Report / danh sách REQ / build mới) trong quỹ thời gian có hạn — nhóm Bắt buộc · Smoke · Theo điểm, mở rộng theo module phụ thuộc, liệt kê đủ TC cố ý bỏ kèm lý do. Điểm minh bạch từ scripts/quality-insights/qi.py. Danh sách dùng thẳng làm phạm vi cho /execute-test-cases. KHÔNG chạy test.
argument-hint: "[ticket · REQ ID · build] [quỹ phút]"
---

> **Skill nền tảng cần nạp trước:** `skills-quality-insights` · `skills-rbt-manual-testing` · `skills-manual-test-executor` — đọc `.claude/skills/<tên-skill>/SKILL.md` của từng skill trước khi bắt đầu.

# Workflow: Chọn Test Thông Minh Cho Một Thay Đổi

> **BẮT BUỘC (MANDATORY SKILL):** Nạp và đọc kỹ **`skills-quality-insights`** — mục **Nguyên tắc gốc**, **3. Chọn & xếp hạng test** và [`references/scoring.md`](../skills-quality-insights/references/scoring.md) mục 3 — trước khi bắt đầu.

Trả lời: *có thay đổi này, có X phút — chạy TC nào, theo thứ tự nào, và cố ý bỏ những gì.*

## ⚠️ Chọn đúng workflow

| User cần | Workflow |
|---|---|
| *"Chọn TC để chạy cho thay đổi này"* | **Workflow này** |
| *"Sửa TC theo ticket"* | `/update-testcases-from-impact` — chạy **trước** nếu REQ đổi chưa có TC |
| *"Retest bug đã fix"* | `/retest-fixed-bugs` (đã tự chọn regression quanh bug) |
| *"Chạy các TC đã chọn"* | `/execute-test-cases` với danh sách từ báo cáo này |

## Input

| Input | Bắt buộc | Ghi chú |
|---|---|---|
| Thay đổi | Có — **một** trong: mã ticket có `impact_<TICKET>.md` · danh sách REQ ID · mô tả build mới + module | Ticket chưa có impact report → đọc ticket, tự quy về REQ, **ghi căn cứ** từng REQ |
| Quỹ thời gian (phút) | Không | Không nêu → không giới hạn, chỉ xếp hạng |
| Nền tảng | Không | Mặc định mọi nền tảng có TC |

## ⚠️ Nguyên tắc thực thi

- **KHÔNG** cắt nhóm *Bắt buộc* cho vừa quỹ — vượt quỹ thì báo, xin thêm thời gian
- **Mọi** TC bị bỏ phải nằm trong danh sách ⏭️ kèm lý do — bỏ mà không ghi là giấu quyết định
- **KHÔNG** chạy test, **KHÔNG** sửa TC
- Tiếng Việt, ngày `DD-MM-YYYY`

---

## Bước 1: Quy thay đổi về REQ

| Đầu vào | Cách làm |
|---|---|
| Ticket có impact report | `--ticket <ID>` — script đọc mục *Tóm tắt* |
| Ticket chưa có impact report | Đọc ticket + requirements module → liệt kê REQ bị chạm kèm câu căn cứ → `--req`. Thay đổi lớn → đề xuất `/update-requirements-from-ticket` trước |
| Danh sách REQ | `--req` |
| "Build mới, module X" | `--modules X` — không có REQ đổi, chỉ xếp theo rủi ro + lịch sử |

## Bước 2: Mở rộng theo phụ thuộc — phần AI

Script **không** biết phụ thuộc giữa module. Đọc:

- `docs/requirements/_discovery/system_map.md` — phụ thuộc giữa module
- `RISK-<MODULE>-nn` của module có thay đổi — dạng *"sau mỗi lần sửa X, chạy kèm smoke của module phụ thuộc"*
- Master Test Plan mục 3.5 *Retest & Regression* (nếu có)

→ Thêm module phụ thuộc vào `--modules`, **ghi căn cứ** từng module thêm vào.

## Bước 3: Chọn & xếp hạng

```bash
python scripts/quality-insights/qi.py select (--ticket <ID> | --req … ) [--modules <module có thay đổi + phụ thuộc>] [--platform …] [--budget <phút>] -o docs/quality-insights/_select_data
```

Lưu ý: `--modules` vừa **giới hạn** dữ liệu vừa **thêm** module vào tập xét — truyền đủ cả module có thay đổi lẫn module phụ thuộc.

## Bước 4: Rà kết quả

1. **REQ đổi chưa có TC** → 🔴 nêu đầu báo cáo, đề xuất `/update-testcases-from-impact` **trước khi chạy**
2. Nhóm *Bắt buộc* vượt quỹ → ⚠️ nêu số phút thiếu, **không** cắt
3. TC nhóm *Theo điểm* điểm bằng nhau ở ranh giới quỹ → giữ thứ tự máy, ghi chú để QA Lead có thể đổi
4. Thời lượng ước tính từ đơn vị chưa có lần chạy (4 phút/TC) → ghi rõ là ước tính

## Bước 5: Xuất báo cáo

`docs/quality-insights/test_selection_<TICKET-ID | mốc>_<YYYYMMDD>.md` — theo **Mẫu báo cáo** mục 4 của skill:

1. Bảng thông tin (thay đổi, REQ, module + module phụ thuộc kèm căn cứ, quỹ thời gian, lệnh `qi.py`)
2. **Kết luận chính** — số TC chọn / phút / số bỏ / REQ chưa phủ
3. **Thứ tự chạy đề xuất** (nguyên văn `qi.py`)
4. **REQ đổi — độ phủ** · **⏭️ Cố ý bỏ** (ô *Người duyệt bỏ: ❓* — QA Lead điền) · **QA tự chạy**
5. **Phạm vi cho `/execute-test-cases`** — khối code liệt kê TC ID theo thứ tự, dán thẳng được
6. **Đề xuất hành động** · **Phương pháp**

Xoá `docs/quality-insights/_select_data.*` sau khi chép bảng.

## Bước 6: Báo user

Số TC · phút · REQ chưa phủ · số TC bỏ. Hỏi user có muốn chạy luôn bằng `/execute-test-cases` với danh sách này không — **không** tự chạy.

## Quality Gate

- [ ] Mỗi REQ đổi có căn cứ; module phụ thuộc thêm vào có căn cứ
- [ ] Nhóm *Bắt buộc* không bị cắt
- [ ] Danh sách ⏭️ đủ, có ô người duyệt
- [ ] REQ chưa có TC đã nêu và đề xuất xử lý trước
- [ ] Có khối TC ID dán thẳng cho `/execute-test-cases`; không còn file `_select_data`
