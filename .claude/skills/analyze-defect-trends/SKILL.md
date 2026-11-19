---
name: analyze-defect-trends
description: Phân tích xu hướng lỗi và vấn đề chất lượng lặp lại trên toàn dự án — đọc kho bug + lịch sử chạy, gom nhóm nguyên nhân gốc, chỉ ra điểm nóng theo module × nền tảng, TC fail chưa có bug, bug mở mà TC đã PASS. Số liệu từ scripts/quality-insights/qi.py, mọi con số truy về mã bug/run/TC. KHÔNG sửa bug hay TC.
argument-hint: "[module] [nền tảng: web|mobile|api]"
---

> **Skill nền tảng cần nạp trước:** `skills-quality-insights` · `skills-test-report-analyzer` · `skills-bug-reporter` — đọc `.claude/skills/<tên-skill>/SKILL.md` của từng skill trước khi bắt đầu.

# Workflow: Phân Tích Xu Hướng Lỗi

> **BẮT BUỘC (MANDATORY SKILL):** Nạp và đọc kỹ **`skills-quality-insights`** (`.claude/skills/skills-quality-insights/SKILL.md`) — mục **Nguyên tắc gốc**, **1. Xu hướng lỗi** (bảng loại nguyên nhân gốc, ngưỡng gọi tên) và **Anti-Patterns** — trước khi bắt đầu.

Trả lời: *lỗi đang dồn vào đâu · có vấn đề nào lặp lại ở nhiều chỗ · quy trình đang rò rỉ ở đâu.*

## ⚠️ Chọn đúng workflow

| User cần | Workflow |
|---|---|
| *"Lần chạy vừa rồi fail vì sao"* | `/analyze-test-report` |
| *"Lỗi dồn vào đâu, lỗi nào lặp lại"* | **Workflow này** |
| *"Release này rủi ro ở đâu"* | `/assess-release-risk` |

## Input

| Input | Bắt buộc | Mặc định |
|---|---|---|
| Phạm vi hệ thống | Không | Mọi hệ thống trong `docs/` — hệ thống thứ hai (`_<hệ-thống>/`) tách bảng |
| Module | Không | Mọi module có bug hoặc lần chạy |
| Nền tảng | Không | Cả `web` · `mobile` · `api` |

## ⚠️ Nguyên tắc thực thi

- Tiếng Việt, ngày `DD-MM-YYYY`, số liệu đặt trước lời bình
- **KHÔNG** gõ tay số liệu — dán bảng của `qi.py`; nhận định viết ngoài bảng
- **KHÔNG** sửa file bug, TC, execution report — mọi việc trên nguồn đưa vào *Đề xuất hành động* kèm workflow
- Cỡ mẫu dưới ngưỡng → *quan sát*, không phải *xu hướng*
- 🔒 Không credentials, không dữ liệu khách hàng — trích dẫn file bug thì trích phần mô tả hành vi

---

## Bước 1: Thu thập & soát dữ liệu

```bash
python scripts/quality-insights/qi.py collect -o reports/quality-insights/<YYYYMMDD>/data
```

Đối chiếu số bug với `docs/bugs/README.md` (và danh mục của từng namespace), số lần chạy với thư mục `docs/executions/`. Lệch → tìm file parser bỏ sót, ghi vào *Giới hạn dữ liệu*. Không có bug **và** không có lần chạy → dừng, báo user: chưa có dữ liệu để phân tích.

## Bước 2: Chạy phân tích

```bash
python scripts/quality-insights/qi.py trends [--modules …] [--system …] -o docs/quality-insights/_trends_data
```

Ghi thẳng vào `docs/quality-insights/` để link trong bảng mở được từ chỗ báo cáo sẽ nằm; chép bảng xong thì **xoá** `_trends_data.*`.

Đọc `trends.md`: bảng A (lỗi theo đơn vị) · B (theo tháng) · C (danh sách lỗi) · D (cụm cùng REQ) · E (xu hướng TC) · F (lỗ hổng quy trình) · G (tỉ lệ đạt theo lần chạy).

## Bước 3: Gom nhóm nguyên nhân gốc — phần AI

1. **Mở từng file bug** ở bảng C (không chỉ đọc tiêu đề) — mục *Actual Result*, *Nghi ngờ root cause*, môi trường, nền tảng
2. Gán **một** loại nguyên nhân (bảng 1.2 của skill) + **một câu căn cứ** trích từ file bug
3. Tìm **vấn đề lặp lại** theo ngưỡng 1.3: cùng loại ở ≥ 2 lỗi và (≥ 2 module / ≥ 2 màn hình / cùng dấu hiệu nguyên văn). Đặt tên vấn đề bằng ngôn ngữ dev hiểu (*"Lưu dữ liệu trên Android thất bại với lỗi chung chung"*), không bằng mã loại
4. Đối chiếu với `RISK-<MODULE>-nn` trong requirements: rủi ro nào đã có lỗi thật chứng minh

## Bước 4: Phân loại TC FAIL chưa có bug

Mỗi TC ở mục F *"TC đang fail mà chưa có bug"*: mở mục *Chi tiết TC FAIL* của execution report tương ứng → xếp **lỗi app** (đề xuất `/create-bug-report`) · **TC sai / lỗi thời** (đề xuất `/review-testcases` mode FIX) · **môi trường** (đề xuất chạy lại). Không đủ căn cứ → *"cần QA xác nhận"*.

Bug ở mục *"Bug còn mở nhưng TC đã PASS"* → đề xuất `/retest-fixed-bugs`.

## Bước 5: Xuất báo cáo

`docs/quality-insights/defect_trends_<YYYYMMDD>.md` — theo **Mẫu báo cáo** mục 4 của skill:

1. Bảng thông tin (phạm vi, nguồn dữ liệu, lệnh `qi.py` đã chạy, giới hạn dữ liệu)
2. **Kết luận chính** — 3–5 dòng, mỗi dòng có số + mã
3. **Nhóm nguyên nhân gốc** — bảng `Loại · Số lỗi · Mã bug · Căn cứ`, rồi **Vấn đề lặp lại** và **Điểm nóng**
4. Bảng A–G của `qi.py` — chép nguyên văn từ `_trends_data.md`
5. **Đề xuất hành động** — `# · Việc · Đối tượng · Command · Ưu tiên`
6. **Phương pháp** — trỏ `references/scoring.md`, ngưỡng cỡ mẫu

Xoá `docs/quality-insights/_trends_data.*` sau khi chép bảng.

## Bước 6: Báo user

Tóm tắt trong chat: 3 kết luận chính + số việc đề xuất + đường dẫn báo cáo. **Không** tự chạy các workflow đề xuất.

## Quality Gate

- [ ] Số bug / run khớp danh mục, hoặc lệch đã ghi ở *Giới hạn dữ liệu*
- [ ] Mỗi lỗi có một loại nguyên nhân + căn cứ trích file bug
- [ ] "Vấn đề lặp lại" qua đúng ngưỡng 1.3; "xu hướng" qua ngưỡng cỡ mẫu
- [ ] TC FAIL chưa có bug đã phân loại
- [ ] Không file nguồn nào bị sửa; không file trung gian nào còn trong `docs/`
