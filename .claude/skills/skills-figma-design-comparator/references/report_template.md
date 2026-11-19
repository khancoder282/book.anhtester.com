# Mẫu báo cáo — `design_compare_report.md`

> Bước 6 của skill. Project có mẫu riêng `plans/design-compare/report_template.md` → dùng mẫu đó, giữ hợp đồng tối thiểu ở cuối file này. Ghi tại `docs/design-reviews/<module>/<nền-tảng>/run_<YYYYMMDD_HHMMSS>/design_compare_report.md` (namespace hệ thống thứ hai: `docs/design-reviews/_<hệ-thống>/<module>/…`). Ngày trong nội dung viết `DD-MM-YYYY`.

````markdown
# So thiết kế Figma ↔ <Web | Mobile web | Android | iOS> — <Tên module> (`<PREFIX>`)

| Mục | Giá trị |
|---|---|
| Mode | WEB / MOBILE-WEB / MOBILE |
| Biến thể | Desktop <bề ngang> · Mobile web — <thiết bị giả lập> <bề ngang> · Android / iOS — <thiết bị> |
| Ngày chạy | DD-MM-YYYY HH:MM – HH:MM (kiểu **Bổ sung**: thêm `· bổ sung <khung>: DD-MM-YYYY HH:MM – HH:MM (cùng bản build)`) |
| Figma | `<tên file>` · page `<tên page>` · <link figma.com/design/<fileKey>> |
| Độ trung thực thiết kế | Wireframe / Mockup / Prototype — <căn cứ nhận biết> |
| Bản build | <URL môi trường web · hoặc app id + version (build)> |
| Môi trường | <Trình duyệt + viewport · hoặc thiết bị, OS, density, status bar, cỡ chữ hệ thống, dark mode, ngôn ngữ> |
| Mốc dọc | Đỉnh header: thiết kế <n> ↔ app <n> (`--actual-top`) — web: không có |
| Dung sai | Vị trí ±<n> · cỡ chữ ±<n> · ΔE chữ ≤ <n> · ΔE nền ≤ <n> (rule `design_compare_rules.md` mục 4 / quy định dự án) |
| Phạm vi khung | <n>/<m> khung (<mã đầu> → <mã cuối>) · <k> ❔ không đưa app tới được |
| Ảnh Figma | `get_screenshot` · khung nào lấy từ **cache** (`dc.py cache`, ngày lưu; không chạy lượt liệt kê thì ghi *"chưa kiểm thay đổi"*) · khung nào **dựng lại từ JSON** (`dc.py render`) và vì sao |
| Dùng chung khung Figma với | <nền tảng / biến thể khác đã so cùng khung — link báo cáo> · chung mã nguồn giao diện: Có / Không (rule mục 6) |
| Dữ liệu | Môi trường dùng chung? Đã tạo/sửa/xoá gì (mặc định: không) · đã che dữ liệu gì trên ảnh / bảng đo |
| Tài liệu liên quan | REQ: `docs/requirements/<module>/…` · TC: `docs/testcases/<module>/…` |

## 1. Tóm tắt

| Mức độ | DIFF 🔴 Mở | Dev | Design | Cần PO quyết | ✅ Khắc phục lượt này | ⚪ Chấp nhận |
|---|---|---|---|---|---|---|
| High | | | | | | |
| Medium | | | | | | |
| Low | | | | | | |
| **Tổng** | | | | | | |

**Nhận xét chung:** 2–4 câu — app bám thiết kế tới đâu, nhóm lệch lớn nhất là gì, có khung nào không so được.

**Dùng chung với module khác (không cấp mã mới):** <thành phần> → `DIFF-<…>` · … — bỏ dòng này nếu không có.

**Cùng khung ở nền tảng khác:** dùng lại `DIFF-<…>` (chung mã nguồn) · liên quan `DIFF-<…>` (khác mã nguồn) · không tái hiện trên nền tảng này: `DIFF-<…>` — bỏ dòng này nếu không có.

## 2. Bản đồ màn hình

| Mã khung | Khung Figma (node-id) | Trạng thái vẽ | Cách tới trên app | Kết quả | DIFF |
|---|---|---|---|---|---|
| A-01 | Sign in (`6:123`) | Mặc định | Avatar › Sign in | ✅ Khớp / ⚠️ n DIFF / ❔ không tới được — <lý do> | DIFF-…-01, 02 |

## 3. Danh sách DIFF

| Mã | Trạng thái | Nền tảng | Khung | Loại | Mức độ | Ai xử lý | Mô tả | Thực tế (số đo) | Thiết kế (số đo) | Liên quan | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DIFF-<MODULE>-01 | 🔴 Mở | Android | A-01 | CONTENT | Low | Dev | | | | — | [side](evidence/…_side.png) · [marked](evidence/…_marked.png) |

> Loại: `CONTENT` · `MISSING` · `EXTRA` · `LAYOUT` · `STYLE` · `ASSET` · `STATE` — rule mục 6.
> *Mô tả* · *Thực tế* · *Thiết kế*: tên phần tử người dùng nhìn thấy + kích thước / margin / padding / gap — **không** toạ độ thô (rule mục 6 *Viết DIFF cho người không đọc toạ độ*). *marked* = ảnh `dc.py mark` (Figma xanh / App đỏ + ghi chú) — bắt buộc với mọi DIFF.
> *Nền tảng*: mọi nền tảng / biến thể đã thấy lệch này (`Mobile web · Android` khi dùng lại mã ở nền tảng chung mã nguồn). *Liên quan*: mã cùng lệch ở nền tảng khác mã nguồn.
> Cột *Khung*: `A-01 · A-03` · dải `B-01 → B-04` · khung module khác `(+ B-09)` (thành phần dùng chung).
> Trạng thái: `🔴 Mở` · `✅ Đã khắc phục (run_<timestamp>)` · `⚪ Chấp nhận — <ai>, <ngày>, <lý do>` · `🗑️ Không còn áp dụng (Figma đổi <ngày>)`. Chạy lại: DIFF cũ **giữ mã và giữ dòng**, chỉ đổi trạng thái + số đo; cột *Mô tả* ghi thêm `(phát hiện lần đầu: run_<timestamp>)` với DIFF không mới.

## 4. Chi tiết từng khung

### A-01 · Sign in

![Figma | App](evidence/A-01_sign_in_side.png)

![Đúng / sai](evidence/A-01_sign_in_marked.png)   ← chỉ khi khung có DIFF

**Kết luận khung:** <khớp / n DIFF>. **Lưới soát:** <n> dòng (vùng · khối · chữ · ô nhập · icon · ảnh) — mọi dòng đã có kết quả.

> Ghi chú khung khi có: thiết kế **lược bớt** (chỉ so chữ + trạng thái) · **dữ liệu mẫu** đã khai `--sample` · ảnh Figma **dựng lại** · dữ liệu đã **che** · thao tác chỉ mở rồi *Cancel*.

Màn nhiều đoạn cuộn: mỗi đoạn một ảnh đặt cạnh nhau + một khối `<details>` bảng đo (ghi `đoạn n` / `--auto-offset`).

<details><summary>Bảng đo tự động (dc.py match)</summary>

<dán nội dung <mã>_match.md — đây là số liệu thô, kết luận nằm ở mục 3>

</details>

<details><summary>Lưới soát ngoài → trong (dc.py checklist)</summary>

<nội dung <mã>_checklist.md, cột *Soát mắt* đã tick ☑ hoặc ghi mã DIFF>

</details>

## 5. Khung không so được

| Khung | Lý do | Cần gì để so |
|---|---|---|

## 6. Ghi chú tham khảo (không tính DIFF)

Khác biệt nằm ngoài phạm vi theo độ trung thực (VD wireframe: màu nền gradient, ảnh thật thay khung giữ chỗ) — ghi để designer biết, không giao việc.

## 7. Việc tiếp theo

- DIFF `Dev` mức High/Medium → `/create-bug-report` (bug trỏ `DIFF-…` + link evidence ở đây, không nhân bản ảnh)
- DIFF `Design` → gửi designer cập nhật Figma
- DIFF `Cần PO quyết` → mở `AMB-<MODULE>-<nn>` trong tài liệu requirements của module
````

**Danh mục** `docs/design-reviews/README.md` — tạo ở lần chạy đầu, mỗi lần chạy cập nhật đúng dòng của module × nền tảng:

```markdown
# Danh mục So thiết kế Figma

| Module | Nền tảng | Biến thể | Figma (page) | Lần chạy gần nhất | Khung đã so | DIFF đã dùng | Mã kế tiếp | DIFF mở (H/M/L) | Báo cáo |
|---|---|---|---|---|---|---|---|---|---|

## Nền tảng & biến thể

| Nền tảng | Biến thể | Bản build | Chung mã nguồn giao diện với | Căn cứ |
|---|---|---|---|---|
| Android | Pixel 10 Pro XL · 448 dp | app Hybrid (Capacitor) | Mobile web | User xác nhận DD-MM-YYYY |

## Sổ khung Figma — tra trước khi cấp mã

| Khung Figma (node-id) | Tên khung | Đã so ở (nền tảng · biến thể → mã khung) | DIFF mở |
|---|---|---|---|
| `6:123` | Sign in | Mobile web 390 → A-01 · Android → A-01 | `DIFF-<MODULE>-02` |

## Nhật ký

| Ngày | Lần chạy | Ghi chú |
|---|---|---|

## Thành phần dùng chung — DIFF ghi một lần

| Thành phần | Mã DIFF | Gặp ở |
|---|---|---|
```

`DIFF đã dùng` / `Mã kế tiếp` đếm **theo module**, dùng chung mọi nền tảng (giống dải REQ) — DIFF web và DIFF Android của cùng module không trùng số. Dòng danh mục khoá theo **module × nền tảng × biến thể** (web desktop và mobile web là hai dòng, cùng thư mục `web/`).

---

## Mẫu riêng của team — hợp đồng tối thiểu

Team muốn báo cáo theo khuôn riêng: chép file này sang `plans/design-compare/report_template.md` rồi sửa. Workflow tự dùng mẫu đó (skill Bước 6). **Được** đổi: thứ tự và tên mục (giữ chữ khoá bên dưới trong tiêu đề), văn phong, thêm dòng vào bảng thông tin đầu, thêm mục mới, thêm cột vào bảng DIFF (viewer hiện cột thêm trong chi tiết DIFF). **Phải giữ** — viewer, `/create-bug-report` và lượt *So lại* đọc theo các tên này:

| Phần | Giữ gì |
|---|---|
| Tiêu đề | Bắt đầu bằng `# So thiết kế Figma ↔ <nền tảng> — <tên module>` |
| Thông tin đầu | Bảng 2 cột `Mục \| Giá trị` trước mục DIFF, có ít nhất *Ngày chạy* · *Figma* · *Độ trung thực thiết kế* · *Biến thể* |
| Bản đồ màn hình | Tiêu đề mục chứa chữ *Bản đồ màn hình*; bảng có cột `Mã khung` · `Khung Figma (node-id)` · `Kết quả` · `DIFF` |
| Danh sách DIFF | Tiêu đề mục chứa chữ *Danh sách DIFF*; bảng có cột `Mã` · `Trạng thái` · `Khung` · `Loại` · `Mức độ` · `Ai xử lý` · `Mô tả` · cột bắt đầu bằng `Thực tế` · cột bắt đầu bằng `Thiết kế` · `Evidence` (nên có `Nền tảng` · `Liên quan`) |
| Chi tiết khung | Heading `### <mã khung> · <tên>` · ảnh `![…](evidence/…)` · bảng đo trong `<details>` |
| Mục phụ | *Không so được* · *Ghi chú tham khảo* · *Việc tiếp theo* — tìm theo chữ, không theo số thứ tự |
| Giá trị | Trạng thái DIFF (`🔴 Mở` · `✅ Đã khắc phục` · `⚪ Chấp nhận` · `🗑️ Không còn áp dụng`), loại, mức độ, ai xử lý — đúng từ của rule mục 6 |
