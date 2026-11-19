---
name: assess-release-risk
description: Chấm rủi ro chất lượng của một mốc release theo module × nền tảng — 5 yếu tố minh bạch (thay đổi · lỗi mở · bất ổn · khoảng trống thực thi · tầm ảnh hưởng), đối chiếu Master Test Plan và rủi ro đã công bố, đề xuất kiểm soát cho từng vùng nóng. Số liệu từ scripts/quality-insights/qi.py. KHÔNG khuyến nghị go/no-go.
argument-hint: "[mốc release, VD release_1.0]"
---

> **Skill nền tảng cần nạp trước:** `skills-quality-insights` · `skills-rbt-manual-testing` · `skills-test-summary-reporter` — đọc `.claude/skills/<tên-skill>/SKILL.md` của từng skill trước khi bắt đầu.

# Workflow: Đánh Giá Rủi Ro Release

> **BẮT BUỘC (MANDATORY SKILL):** Nạp và đọc kỹ **`skills-quality-insights`** — mục **Nguyên tắc gốc**, **2. Rủi ro release** và [`references/scoring.md`](../skills-quality-insights/references/scoring.md) — trước khi bắt đầu.

Trả lời: *release này rủi ro ở module × nền tảng nào, vì sao, cần kiểm soát gì trước mốc.* Đầu ra là **đầu vào** cho `/generate-test-summary-report` — không thay nó.

## ⚠️ Chọn đúng workflow

| User cần | Workflow |
|---|---|
| *"Vùng nào rủi ro, dồn lực vào đâu"* | **Workflow này** |
| *"Có release được không"* | `/generate-test-summary-report` (đọc kèm báo cáo này) |
| *"Thay đổi này chạy TC nào"* | `/select-regression-tests` |

## Input

| Input | Bắt buộc | Nguồn |
|---|---|---|
| Mốc release (`<mốc>`, VD `release_1.0`) | Có | User nêu, hoặc `docs/test-plans/test_plan_<mốc>.md` duy nhất đang mở |
| Ticket thuộc đợt | Không | Plan · user nêu · impact report sau ngày bắt đầu đợt |
| Module / nền tảng trong phạm vi | Không | Mục 2.1 của plan |

## ⚠️ Nguyên tắc thực thi

- **KHÔNG** khuyến nghị go/no-go, **KHÔNG** sửa plan — đề xuất điều chỉnh đưa vào mục *Đề xuất hành động*
- **KHÔNG** sửa điểm của máy — thấy sai thì ghi *Nhận định QA* bên cạnh, nêu lý do
- Đơn vị ⬛ (thiếu dữ liệu) **không** được diễn giải là an toàn
- Tiếng Việt, ngày `DD-MM-YYYY`; 🔒 không credentials, không dữ liệu khách hàng

---

## Bước 0: Chốt phạm vi

1. Tìm `docs/test-plans/test_plan_<mốc>.md`. Có → lấy module × nền tảng ở mục **2.1 Trong phạm vi**, ngày bắt đầu đợt ở mục **7.1**, rủi ro sản phẩm ở **8.2**. Không có → hỏi user mốc + module; báo trước *"không có Master Test Plan — không đối chiếu được rủi ro đã công bố"*
2. Ticket: user nêu → `--ticket`. Không nêu → `--since <ngày bắt đầu đợt>`. Không có cả hai → hỏi user một câu; user bảo "tính hết" thì chạy không giới hạn và ghi rõ *"C cộng dồn mọi impact report từ trước tới nay"*
3. Hệ thống thứ hai (`_<hệ-thống>/`) thuộc mốc khác → `--system default` để không lẫn

## Bước 1: Thu thập & soát

```bash
python scripts/quality-insights/qi.py collect -o reports/quality-insights/<YYYYMMDD>/data
```

Như `/analyze-defect-trends` bước 1.

## Bước 2: Chấm điểm

```bash
python scripts/quality-insights/qi.py risk --modules <…> [--system …] (--ticket A,B | --since DD-MM-YYYY) -o docs/quality-insights/_risk_data
```

## Bước 3: Nhận định — phần AI

Với **mỗi** đơn vị 🔴 và 🟠:

1. **C** — REQ đổi chưa có TC: đọc *Tóm tắt* của impact report — REQ đó có phải **cố ý ngoài phạm vi viết TC** không. Có → ghi *Nhận định QA: G thực tế thấp hơn vì …*
2. **D** — lỗi Critical/Major: đọc file bug — đã có hướng sửa chưa, có đường vòng không, có chặn tiêu chí exit nào của plan (mục 4.2) không
3. **I** — ⬛ chưa có lần chạy: ghi rõ đơn vị này **chưa có bằng chứng thực thi**, không phải "ổn"
4. **G** — TC High/Critical chưa chạy: liệt kê số lượng, đề xuất chạy trước
5. Đối chiếu bảng **8.2 Rủi ro sản phẩm** của plan / `RISK-<MODULE>-nn`: rủi ro nào đã **thành hiện thực** (có lỗi), rủi ro nào **chưa có bằng chứng kiểm** (đơn vị ⬛)
6. **Kiểm soát đề xuất** cho từng đơn vị — workflow cụ thể: `/select-regression-tests` · `/execute-test-cases` · `/retest-fixed-bugs` · `/update-testcases-from-impact`

## Bước 4: Xuất báo cáo

`docs/quality-insights/release_risk_<mốc>_<YYYYMMDD>.md` — theo **Mẫu báo cáo** mục 4 của skill:

1. Bảng thông tin (mốc, plan, phạm vi, ticket / `--since`, lệnh `qi.py`, giới hạn dữ liệu)
2. **Kết luận chính** — vùng 🔴 kèm yếu tố đẩy điểm lên
3. **Bảng điểm** (nguyên văn từ `qi.py`) + **Căn cứ từng yếu tố**
4. **Nhận định QA** cho từng 🔴/🟠
5. **Rủi ro đã công bố ↔ bằng chứng** — `RISK-… · Đã thành lỗi? (mã bug) · Đã kiểm? · Ghi chú`
6. **Đề xuất hành động** · **Phương pháp**

Xoá `docs/quality-insights/_risk_data.*` sau khi chép bảng.

## Bước 5: Báo user

Vùng 🔴, yếu tố chính, 3 việc nên làm trước mốc, đường dẫn báo cáo. Nhắc: kết luận release dùng `/generate-test-summary-report`.

## Quality Gate

- [ ] Phạm vi khớp plan (hoặc đã ghi vì sao không có plan)
- [ ] C chỉ tính ticket thuộc đợt — hoặc đã ghi rõ cộng dồn
- [ ] Mỗi 🔴/🟠 có nhận định QA + kiểm soát đề xuất có workflow
- [ ] Đơn vị ⬛ được nêu là *chưa có bằng chứng*, không phải an toàn
- [ ] Không có câu go/no-go; không file nguồn nào bị sửa; không còn file `_risk_data`
