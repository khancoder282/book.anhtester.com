---
name: compare-ui-from-figma-design
description: So bản thiết kế Figma với giao diện đã xây dựng thật — 3 mode WEB (Playwright MCP), MOBILE-WEB (trình duyệt điện thoại — Playwright MCP giả lập thiết bị) và MOBILE (Appium MCP — Android/iOS/Hybrid). Trích spec Figma chỉ-đọc (có cache), đo lệch chữ · vị trí · khoảng cách · màu · cỡ chữ theo dp/pt/px, đi lưới soát ngoài → trong, ghi DIFF có loại · mức độ · ai xử lý kèm ảnh khoanh đúng / sai, không log trùng giữa các nền tảng dùng chung khung Figma. Xuất báo cáo + evidence vào docs/design-reviews/.
argument-hint: "[WEB|MOBILE-WEB|MOBILE] [link Figma] [module]"
---

> **Skill nền tảng cần nạp trước:** `skills-figma-design-comparator` · `skills-mobile-debug-agent` · `skills-ui-debug-agent` — đọc `.claude/skills/<tên-skill>/SKILL.md` của từng skill trước khi bắt đầu.

# Workflow: So Thiết Kế Figma Với UI Thật

> **BẮT BUỘC (MANDATORY SKILL):** Nạp và đọc kỹ **`skills-figma-design-comparator`** (`.claude/skills/skills-figma-design-comparator/SKILL.md`) — quy trình 6 bước, cách đọc bảng đo, viết DIFF. Mode WEB đọc thêm `references/web.md`; mode MOBILE-WEB đọc `references/web.md` **kể cả mục 7**; mode MOBILE đọc `references/mobile.md` — **chỉ một** file.
>
> **Rule bắt buộc:** [`.claude/rules/design_compare_rules.md`](../../rules/design_compare_rules.md) — độ trung thực, đơn vị, dung sai, phân loại DIFF, cấm.
>
> Thao tác thiết bị: `skills-mobile-debug-agent` (MOBILE) · thao tác trình duyệt: `skills-ui-debug-agent` (WEB · MOBILE-WEB).

---

## Cú pháp

```
/compare-ui-from-figma-design <MODE> <link Figma> [module] [khung] [độ trung thực] [kiểu chạy]
```

| Tham số | Bắt buộc | Ví dụ |
|---|---|---|
| `MODE` | ✅ | `WEB` (desktop) · `MOBILE-WEB` (trình duyệt trên điện thoại) · `MOBILE` (app Android / iOS / Hybrid) |
| Link Figma | ✅ | `https://www.figma.com/design/<fileKey>/...` — có `node-id` thì giới hạn vào page/khung đó |
| Module | Nên có | `auth` — để ghi đúng `docs/design-reviews/<module>/` và nối REQ/TC |
| Khung | Không | `A-01,A-02` hoặc `tất cả` (mặc định: mọi khung màn hình trong page của `node-id`) |
| Độ trung thực | Không | `wireframe` · `mockup` — không ghi thì agent tự nhận biết, không chắc thì hỏi |
| Kiểu chạy | Không | *(trống)* = đầy đủ · `nhanh` = xem nhanh, trả lời trong chat, **không** ghi `docs/` · `bổ sung` = ghi thêm khung vào lượt chạy gần nhất (cùng ngày, cùng bản build) · `khung=còn-mở` = so lại các khung còn DIFF 🔴 — skill mục *Chọn cách chạy* |

Ví dụ:

```
/compare-ui-from-figma-design MOBILE https://www.figma.com/design/<fileKey>/Book?node-id=7-1 user
/compare-ui-from-figma-design MOBILE https://www.figma.com/design/<fileKey>/Book?node-id=6-607 auth A-07,A-08 bổ sung
/compare-ui-from-figma-design WEB https://www.figma.com/design/<fileKey>/CRM?node-id=12-40 customers nhanh
/compare-ui-from-figma-design MOBILE-WEB https://www.figma.com/design/<fileKey>/Shop?node-id=4-1 cart
/compare-ui-from-figma-design MOBILE https://www.figma.com/design/<fileKey>/Book?node-id=9-1 book khung=còn-mở
```

Đích so sánh: MODE WEB / MOBILE-WEB lấy URL từ `.env` / tài liệu module, hoặc user đưa — MOBILE-WEB chạy trên server MCP `playwright-mobile` (`--device`, khai trong `.mcp.json`; chưa có tool `mcp__playwright-mobile__*` trong phiên → báo user khởi động lại Claude Code) · MODE MOBILE dùng app đã khai trong `capabilities.json` (Android) hoặc user đưa bundle id (iOS).

Mẫu báo cáo: `plans/design-compare/report_template.md` nếu project có (mẫu riêng của team), không thì mẫu chuẩn của skill.

---

## ⚠️ Ranh giới của workflow này

| Workflow này **CÓ** làm | Workflow này **KHÔNG** làm |
|---|---|
| Đọc Figma **chỉ đọc**, so với UI thật, ghi DIFF có số đo + ảnh | ❌ Sửa file Figma · ❌ sửa code app |
| Đưa app/web tới đúng trạng thái khung vẽ (đăng nhập, mở menu, gây lỗi validation) | ❌ Lưu/Xoá dữ liệu thật trên môi trường dùng chung để tạo trạng thái |
| Khung không tới được → ❔ kèm lý do | ❌ Rút requirements từ Figma — việc của `skills-requirements-analyzer` 3.3 |
| Gợi ý DIFF nào thành bug, DIFF nào cần PO | ❌ Tự tạo bug — user gọi `/create-bug-report` |

---

## Các bước thực hiện

### Bước 0: Tiếp nhận & đọc trạng thái repo

1. Tách `fileKey` và `node-id` từ link (`node-id=1-2` → `1:2`)
2. Đọc **danh mục** `docs/design-reviews/README.md` — hệ thống thứ hai trong namespace thì `docs/design-reviews/_<hệ-thống>/README.md` (chưa có → tạo theo `references/report_template.md`) → mã DIFF kế tiếp của module
3. **Đã từng so module × nền tảng × biến thể này?** Mở báo cáo `run_*` gần nhất (danh mục có link) → lấy danh sách DIFF 🔴 Mở và ⚪ Chấp nhận — lượt này phải đối chiếu lại **từng** DIFF đó (rule mục 6 — vòng đời DIFF)
4. **Cùng khung Figma đã so ở nền tảng / biến thể khác?** (VD chạy app sau mobile web, chung bộ khung) — đọc bảng **Sổ khung Figma** + **Nền tảng & biến thể** của danh mục → ghi lại các DIFF 🔴 Mở theo node-id khung, và hai nền tảng có chung mã nguồn giao diện không (chưa ghi → hỏi user **một câu**, ghi vào bảng). Bước 5 dùng danh sách này trước khi cấp mã (rule mục 6 — *một lệch, không log trùng*)
5. Đọc `docs/requirements/README.md` + `_discovery/system_map.md` (hoặc của namespace) → **đường điều hướng** tới từng màn hình, môi trường dùng chung hay không. Có tài liệu module thì mở index để biết REQ nào nói về màn hình sắp so
6. Đọc bảng **Thành phần dùng chung** trong danh mục — lệch ở header, bottom nav, ô nhập… đã có mã thì lượt này chỉ dẫn chiếu
7. **Cache Figma** (rule mục 9): kho `reports/design-compare/_cache/<fileKey>/` — Bước 1 chạy `dc.py cache plan` để biết khung nào dùng lại spec + ảnh, chỉ gọi Figma cho khung đổi / mới. Gói Starter có hạn mức; khung phải lấy mới thì lấy **mọi** khung đó ngay đầu phiên
8. Công bố một câu: *"So `<n>` khung page `<tên>` với **Android** `emulator-5554` (448 dp, density 480) — thiết kế mức **wireframe**, kiểu chạy **đầy đủ**, `<k>` khung lấy từ cache, cùng khung đã có `<m>` DIFF mở ở **Mobile web** (chung mã nguồn), DIFF mới bắt đầu từ `DIFF-<MODULE>-<nn>`."*

### Bước 1: Bản đồ màn hình — skill Bước 1

`figma_extract.js` (`FRAME_IDS = []`) → `reports/design-compare/<run>/figma_listing.json` (mỗi khung có dấu vân tay `fp`) → bảng Screen Map (mã khung · node-id · trạng thái vẽ · cách tới · đạt được?). Khai báo độ trung thực. `dc.py cache plan --listing … --cache reports/design-compare/_cache/<fileKey> --frames <phạm vi>` → khung nào dùng cache, `FRAME_IDS` cần trích, số lượt gọi còn lại.

### Bước 2: Trích spec Figma — skill Bước 2

`dc.py cache get … -o reports/design-compare/<run>/` chép bản còn hiệu lực. Khung 🔄 / 🆕 / 🟡: `figma_extract.js` (3–4 khung một lần) → `figma_<id>.json` · `get_screenshot` → `curl` **ngay** → `figma_<id>.png` → `dc.py cache put …` cất vào kho. Hết hạn mức ảnh → `dc.py render figma_<id>.json -o figma_<id>.png`, evidence đặt tên `_figma_render.png`.

`<run>` = `<module>_<nền-tảng>_<YYYYMMDD_HHMMSS>` — trùng với thư mục `run_*` sẽ ghi ở `docs/`.

### Bước 3: Thu dữ liệu UI thật — theo MODE

MODE **MOBILE-WEB** = cột WEB, chạy trên tool `mcp__playwright-mobile__browser_*` (giả lập thiết bị) + `browser_resize` về bề ngang khung + kiểm `pointer: coarse` / UA mobile trước khi đo (`web.md` mục 7). **Không** thu hẹp Chrome desktop, **không** giả lập bằng CDP.

| | MODE **MOBILE** (`references/mobile.md`) | MODE **WEB** (`references/web.md`) |
|---|---|---|
| Mở | `appium_session_management create` → nhận diện loại app → `appium_mobile_device_info` | `browser_navigate` → `browser_resize` về bề ngang khung (≤ cửa sổ) → chờ `document.fonts.ready` |
| Cấu hình chuẩn | density · status bar · nav bar · **đỉnh header** (mốc dọc) · `font_scale = 1.0` · dark mode theo khung | viewport = bề ngang khung · font đã tải |
| Tới trạng thái | Locator + `appium_gesture tap` · ẩn bàn phím | Locator từ `browser_snapshot` |
| Ảnh | `adb exec-out screencap -p` (Android) | `browser_take_screenshot fullPage scale=css filename=…` |
| Cây / spec | `appium_get_page_source saveToFile` → `dc.py android-tree` / `ios-tree --png` | `browser_evaluate` + `collect_dom.js` + `filename=…` |
| Màn dài | Cuộn từng đoạn, chồng lấn, `--auto-offset` — **luôn cuộn hết màn thật** dù khung Figma chỉ vẽ một màn | Full page một lần |
| Lớp phủ (menu, dialog) | `SCOPE` khi trích Figma — cây chỉ còn lớp phủ | `ROOT_SELECTOR` trong `collect_dom.js` |

**Mở lại ảnh app** trước khi đo — sai trạng thái thì chụp lại.

### Bước 4: Đo — skill Bước 4

```bash
python scripts/design-compare/dc.py match  figma_<id>.json <mã>_actual.json --actual-top <đỉnh header> -o <run>/<mã>_match   # WEB: --tol 2 --de-text 3
python scripts/design-compare/dc.py visual figma_<id>.png  <mã>_app.png --design figma_<id>.json --actual <mã>_actual.json --actual-top <đỉnh header> -o <run>/<mã>
```

### Bước 5: Soát trên ảnh → DIFF — skill Bước 5

1. **Lưới soát** `dc.py checklist figma_<id>.json --match <mã>_match.json … -o <run>/<mã>_checklist.md` → mở cạnh `<mã>_side.png`, đi **ngoài → trong, trên → dưới, trái → phải** (rule mục 4b); mỗi dòng phải có ✅ / ☑ / mã DIFF
2. Đi từng dòng ❌ ⚠️ 🔍 ➕ ❔ của bảng đo. Mỗi lệch thật = 1 DIFF (cùng nguyên nhân gộp một)
3. **Trước khi cấp mã**, tra theo thứ tự: DIFF lượt trước cùng nền tảng × biến thể → DIFF cùng node-id khung ở nền tảng / biến thể khác (Bước 0 mục 4) → *Thành phần dùng chung* ở module khác

Gán **loại · mức độ · ai xử lý** theo rule mục 6 — lỗi hiển nhiên (chữ sai nghĩa, thiếu dữ liệu trong câu, lỗi dính từ form khác, thông tin khuất) là `Dev` dù thiết kế vẽ theo app. DIFF hành vi giao Dev → **tái hiện lại** một lần từ trạng thái sạch.

**Ảnh khoanh đúng / sai** (rule mục 7, skill Bước 5d): spec JSON mỗi DIFF một mục (`figma` · `app` · `expected` · `actual` — ghi chú bằng margin / padding / gap / kích thước, không toạ độ) → `dc.py mark figma_<id>.png <mã>_app.png --design … --actual … --match … --spec <mã>_marks.json -o evidence/<mã>_<mô_tả>_marked.png`. Mở lại ảnh: khung xanh và đỏ cùng số phải là cùng một phần tử.

Kiểu `nhanh`: dừng ở đây — trả lời trong chat bằng ảnh `mark` (nhãn là số thứ tự lệch) + danh sách lệch (chưa cấp mã), hỏi user có muốn lưu thành lượt chạy đầy đủ không.

Có lần chạy trước → **trước khi cấp mã mới**, đối chiếu từng lệch với DIFF cũ: còn lệch → giữ mã cũ · hết lệch → `✅ Đã khắc phục` · lệch đã `⚪ Chấp nhận` → không báo lại. Chỉ lệch chưa có DIFF mới được cấp mã nối tiếp.

### Bước 6: Ghi báo cáo & danh mục

1. **Che dữ liệu** người khác trước khi copy: ảnh `dc.py mask` (rồi dựng lại `_side` từ ảnh đã che) · bảng đo `match --redact`
2. Copy evidence vào `docs/design-reviews/<module>/<nền-tảng>/run_<timestamp>/evidence/` — mỗi khung: `<mã>_<mô_tả>_figma.png` (hoặc `_figma_render.png`) · `_app.png` · `_side.png` (+ `_marked.png` của `dc.py mark` nếu có DIFF; nhiều đoạn cuộn thêm `_part<n>`). **Không** copy page source, spec JSON, spec khoanh, ảnh chồng, bản đồ khác biệt. Mobile web ghi vào `<module>/web/` với ô *Biến thể* = `Mobile web — <thiết bị> · <bề ngang>`
3. Viết `design_compare_report.md` theo mẫu riêng `plans/design-compare/report_template.md` (nếu có — giữ hợp đồng tối thiểu) hoặc `references/report_template.md` — mục 4 sinh bằng `dc.py sections` từ các `<mã>_match.md` + `<mã>_checklist.md`. Kiểu `bổ sung`: sửa báo cáo của `run_*` gần nhất thay vì tạo thư mục mới
4. Kiểm mọi link `evidence/…` trỏ tới file có thật
5. Cập nhật danh mục (`docs/design-reviews/README.md` hoặc `_<hệ-thống>/README.md`): dòng module × nền tảng × biến thể · Nhật ký · *Nền tảng & biến thể* · **Sổ khung Figma** (node-id → nơi đã so → DIFF mở) · *Thành phần dùng chung*
6. Đóng phiên: `appium_session_management delete` (MOBILE) · `browser_resize 1600×750` (WEB) · `mcp__playwright-mobile__browser_close` (MOBILE-WEB)

### Checklist bàn giao

- [ ] Đã khai báo độ trung thực + dung sai ở đầu báo cáo; DIFF không vượt phạm vi của độ trung thực
- [ ] Mọi khung trong phạm vi có kết quả: ✅ / DIFF / ❔ kèm lý do — không khung nào biến mất im lặng
- [ ] Mỗi DIFF có số đo ở cả **Thực tế** và **Thiết kế** — viết bằng tên phần tử nhìn thấy + kích thước / margin / padding / gap, **không** toạ độ thô — có loại · mức độ · ai xử lý
- [ ] Mỗi DIFF có ảnh `_marked.png` (`dc.py mark`): Figma khung xanh | App khung đỏ cùng số + ghi chú Thiết kế / Thực tế
- [ ] Lưới soát (`dc.py checklist`) của mọi khung không còn ô ☐ — đã đi ngoài → trong, trên → dưới, trái → phải
- [ ] Đã tra *Sổ khung Figma*: lệch đã có ở nền tảng / biến thể khác cùng khung → dùng lại mã (chung mã nguồn) hoặc ghi *Liên quan* — không log trùng
- [ ] Khung lấy từ cache được ghi ở ô *Ảnh Figma*; khung vừa trích mới đã `cache put`
- [ ] Không DIFF nào chỉ dựa trên bảng đo tự động mà chưa xem ảnh đặt cạnh nhau
- [ ] Lệch dây chuyền đã gộp về chỗ khởi phát — không 5 DIFF cho cùng một nguyên nhân
- [ ] Đã mở lại mọi ảnh trong `evidence/`; ảnh khoanh đúng chỗ
- [ ] File Figma không bị sửa; `docs/` không có page source, credentials, dữ liệu khách hàng thật — kiểm cả **ảnh** lẫn **bảng đo** trong báo cáo
- [ ] Không tạo / sửa / xoá bản ghi thật nào để có trạng thái (form chỉ submit khi validation chặn, hộp xoá chỉ *Cancel*)
- [ ] Lệch ở thành phần dùng chung đã dẫn chiếu mã cũ, không cấp mã trùng nghĩa ở module khác
- [ ] Khung dùng ảnh Figma dựng lại (`render`) được ghi rõ ở đầu báo cáo và ở mục 5
- [ ] Danh mục `docs/design-reviews/README.md` đã cập nhật mã kế tiếp
- [ ] Chạy lại: mọi DIFF 🔴 Mở / ⚪ Chấp nhận của lần trước đều có trạng thái mới trong báo cáo này — không DIFF cũ nào biến mất, không cấp mã mới cho lệch cũ

**Báo cáo cho user:** số khung đã so / ❔ · số DIFF theo mức độ và người xử lý · 3 DIFF quan trọng nhất · link báo cáo · lệnh kế tiếp.

---

## Mối quan hệ với workflows khác

```
Figma ──→ /compare-ui-from-figma-design ──→ DIFF (Dev, High/Medium) ──→ /create-bug-report ──→ /retest-fixed-bugs
                       │                         DIFF (Cần PO quyết) ──→ AMB trong requirements (/update-requirements-from-ticket)
                       └── dùng system_map.md (đường điều hướng) · REQUIREMENTS_<MODULE>_SUMMARY.md (đối chiếu REQ)
```

| Tình huống | Workflow |
|---|---|
| Chưa biết app có những màn hình nào | `/discover-system` |
| Figma là tài liệu nghiệp vụ duy nhất, cần REQ | `/analyze-requirement-document` hoặc nhánh tài liệu của `/generate-requirements-from-website` / `-mobile` |
| Ghi bug cho DIFF | `/create-bug-report` — bug trỏ mã DIFF + link evidence trong `docs/design-reviews/` |
| Dev/designer đã sửa, so lại | Chạy lại workflow này cho đúng khung — lần chạy mới **giữ mã** DIFF cũ, đổi trạng thái (rule mục 6 — vòng đời DIFF) |
