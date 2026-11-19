---
name: skills-figma-design-comparator
description: Skill so bản thiết kế Figma với giao diện đã xây dựng thật — web desktop, mobile web (Playwright MCP giả lập thiết bị) và app mobile Android/iOS/Hybrid (Appium MCP). Trích spec Figma bằng script chỉ-đọc (chữ, toạ độ, font, màu), thu cây phần tử + ảnh của UI thật, đo lệch theo đơn vị dp/pt/px có neo theo bề ngang màn hình, người soát đi lưới soát ngoài → trong để không sót phần tử, xác nhận trên ảnh đặt cạnh nhau rồi ghi DIFF có loại · mức độ · ai xử lý, kèm ảnh khoanh đúng (Figma) / sai (App) có ghi chú. Cache spec + ảnh Figma để khỏi tốn lượt gọi MCP; một lệch dùng chung khung Figma giữa mobile web và app không bị log trùng. Dùng khi tester cần biết app/web có làm đúng thiết kế không, soát UI trước release, review pixel-perfect, đối chiếu mockup với bản build, kiểm màn hình theo Figma — kể cả khi user chỉ dán link figma.com và hỏi "app đã đúng design chưa".
user-invocable: false
---

# Figma Design Comparator

Purpose: Trả lời câu hỏi **"giao diện đã xây có đúng bản thiết kế không — lệch ở đâu, lệch bao nhiêu, ai phải sửa"** bằng số đo thật và ảnh đối chiếu, không bằng cảm giác nhìn hai ảnh.

Quy tắc bắt buộc (dung sai, đơn vị, phân loại DIFF, cấm): [`.claude/rules/design_compare_rules.md`](../../rules/design_compare_rules.md) — đọc trước khi đo.
Công cụ: [`scripts/design-compare/`](../../../scripts/design-compare/README.md) — `figma_extract.js` · `collect_dom.js` · `dc.py`.
Mẫu báo cáo riêng của team (nếu có): `plans/design-compare/report_template.md` — xem Bước 6.

---

## When to Use

- Có link Figma (khung màn hình) và một bản build web / app chạy được — cần biết làm đúng thiết kế chưa
- Soát UI trước release, sau khi dev báo "đã làm theo design", hoặc khi designer cập nhật Figma
- Đối chiếu một luồng nhiều màn (đăng nhập → dashboard → menu…) với bộ khung Figma tương ứng

**Không dùng khi:**

| Việc | Dùng cái khác |
|---|---|
| Đọc Figma để **rút requirements** (field, rule, message) | `skills-requirements-analyzer` mục 3.3 — Figma là tài liệu đầu vào, không phải chuẩn để chấm |
| So ảnh chụp **phiên bản app này với phiên bản trước** (visual regression) | Snapshot test của framework automation — đó là so app với chính nó |
| Dựng / sửa thiết kế trong Figma | Các skill Figma (`figma-use`…) — skill này **chỉ đọc** Figma |

---

## Chọn cách chạy — theo việc tester cần

Không phải lần nào cũng chạy đủ cả page. Chọn kiểu chạy **trước** Bước 1 — kiểu chạy quyết định có ghi `docs/` không và lấy mã DIFF thế nào:

| Tester cần | Kiểu chạy | Làm gì khác so với mặc định |
|---|---|---|
| Soát cả page / cả luồng | **Đầy đủ** (mặc định) | 6 bước, báo cáo + evidence vào `docs/design-reviews/`, cấp mã DIFF |
| Chỉ vài màn | **Chọn khung** — `khung=A-01,A-03` | Như đầy đủ, Bản đồ màn hình chỉ liệt kê khung đã chọn; *Phạm vi khung* ghi `n/m` |
| "Màn này đúng design chưa?" — hỏi nhanh, chưa cần lưu | **Xem nhanh** — `nhanh` | Bước 1–5 cho 1–2 khung; trả lời trong chat bằng **ảnh khoanh đúng / sai** (`dc.py mark`, nhãn là số thứ tự) + danh sách lệch **chưa cấp mã**. Không ghi `docs/`. User muốn lưu → chạy lại kiểu đầy đủ |
| Dev/designer báo đã sửa | **So lại** — `khung=còn-mở` | Chỉ các khung còn DIFF 🔴 Mở ở lần trước; thư mục `run_*` mới; giữ mã, đổi trạng thái (rule mục 6 — vòng đời) |
| Lượt trước bỏ dở vài khung, **cùng ngày, cùng bản build** | **Bổ sung** — `bổ sung` | Ghi thêm vào **chính** `run_*` gần nhất: dòng *Ngày chạy* thêm khoảng giờ bổ sung, cập nhật Tóm tắt / Bản đồ / mục 5. Khác bản build → phải là lượt **mới** |
| Có Figma nhưng không đưa app tới được trạng thái | Như trên + ❔ | Khung đó ghi ❔ kèm *cần gì để so* — không bỏ im lặng |

---

## Hai nguồn, một định dạng

Mọi phía đều quy về **spec JSON** cùng cấu trúc — `dc.py` so được bất kỳ cặp nào:

```
Figma ──(use_figma + figma_extract.js, CHỈ ĐỌC · cache theo dấu vân tay)─┐
Web   ──(browser_evaluate + collect_dom.js, filename=…)──────┤→ spec JSON → dc.py match → bảng đo
Mobile web ─(như Web, trên server playwright-mobile --device)─┤          dc.py checklist → lưới soát ngoài → trong
Android ─(page source + ảnh + dc.py android-tree)──────────┤          dc.py visual → ảnh đặt cạnh nhau / chồng / khác biệt
iOS   ──(page source + ảnh + dc.py ios-tree)──────────────────┘          dc.py mark → ảnh khoanh đúng / sai + ghi chú
```

| Nguồn | Có gì | Thiếu gì |
|---|---|---|
| Figma (`figma_extract.js`) | Chữ thật (kể cả chữ trong component), toạ độ tương đối khung, cỡ/độ đậm/font/line-height, màu chữ, màu nền/viền, bo góc | — (nguồn đầy đủ nhất) |
| Web (`collect_dom.js`) | Như Figma — computed style chính xác, khung chữ đo bằng Range (ink box) | Bóng đổ, gradient chỉ biết có/không |
| Mobile web (`collect_dom.js` trên `playwright-mobile`) | Như Web — trang ở đúng chế độ mobile (UA, cảm ứng, DPR) | Engine thật của máy (Safari iOS) — cần thì chụp thêm máy thật để soát mắt (`web.md` 7.3) |
| Android / iOS native | Chữ, khung phần tử (dp/pt) | **Không có** font, cỡ chữ, màu → màu lấy mẫu trên ảnh chụp; cỡ chữ suy từ chiều cao dòng |
| Hybrid WebView không bật debug | Như native — WebView đưa chữ lên cây trợ năng, hay **gộp** chữ của phần tử con | Như native |

> **Vì sao không dùng `get_metadata` / `get_design_context` làm nguồn chính:** `get_metadata` không trả chữ bên trong instance (nút chỉ hiện `name="Label"`), không có màu/font; `get_design_context` trả code React/Tailwind — trích được nhưng phải parse JSX. `figma_extract.js` qua `use_figma` trả thẳng `characters`, `fontSize`, `fills` của từng node — chính xác và gọn. Hai tool kia vẫn dùng để **xem** (ảnh, token biến `get_variable_defs`).

---

## Quy trình 6 bước

### Bước 1 — Bản đồ màn hình (Screen Map)

1. Chạy `figma_extract.js` với `FRAME_IDS = []` → danh sách **mọi page + khung cấp 1**, mỗi khung kèm **dấu vân tay** `fp` — ghi nguyên văn ra `reports/design-compare/<run>/figma_listing.json`. ⚠️ `get_metadata` không truyền `nodeId` chỉ liệt kê page **đã tải** trong Figma desktop — đừng kết luận file chỉ có 1 page từ đó
2. Lọc khung màn hình thật — bỏ section kit/component, khung caption, note, page header (nhận biết qua tên và kích thước: khung màn mobile ~360–430 rộng, web ~1280–1920)
3. Với mỗi khung: ghi **trạng thái** khung vẽ (mặc định · lỗi validation · đã đăng nhập · menu mở · có toast…) và **cách đưa app tới đúng trạng thái đó** (đường điều hướng, dữ liệu cần nhập, tài khoản cần dùng). Đọc `docs/requirements/_discovery/system_map.md` của dự án để có đường điều hướng — không tự dò lại
4. Khai báo **độ trung thực** (rule mục 2) — wireframe hay mockup quyết định cái gì được tính DIFF
5. **Đọc ghi chú trong khung** trước khi so: *"lược bớt"*, *"dữ liệu mẫu"*, *"đã cuộn xuống phần …"*, *"full scroll"*, vai trò (*khách / đã đăng nhập*). Mỗi ghi chú đổi cách đo (rule mục 5) — bỏ qua là ra hàng chục DIFF giả
6. **Tra cache + ước lượng lượt gọi Figma MCP** — gói Starter giới hạn số lượt gọi; hết giữa chừng thì mất ảnh các khung còn lại (rule mục 9):

   ```bash
   python scripts/design-compare/dc.py cache plan --listing reports/design-compare/<run>/figma_listing.json \
          --cache reports/design-compare/_cache/<fileKey> --frames <các node-id trong phạm vi>
   ```

   In ra khung nào ✅ dùng lại spec + ảnh đã lưu, khung nào 🔄 Figma đã đổi / 🆕 chưa có, `FRAME_IDS` cần trích và số lượt gọi còn lại. Page lớn mà nhiều khung phải lấy mới → trích + lấy ảnh **mọi** khung đó ngay đầu phiên, các bước sau chỉ đọc file

| Mã khung | Tên khung Figma | node-id | Trạng thái vẽ | Cách tới trên app | Đạt được? |
|---|---|---|---|---|---|
| A-01 | Sign in | `6:123` | Mặc định, ô trống | Avatar → *Sign in* | ✅ |
| A-02 | Sign in — validation | `6:168` | Bấm Login khi để trống | A-01 + bấm *Login account* | ✅ |

Khung không đưa app tới được (cần dữ liệu đặc biệt, quyền admin không có) → ❔ kèm lý do ở báo cáo, **không** bỏ qua im lặng.

### Bước 2 — Trích spec Figma

Trước hết chép bản còn hiệu lực từ cache: `dc.py cache get --listing … --cache … -o reports/design-compare/<run>/`. Chỉ khung `cache plan` báo 🔄 / 🆕 / 🟡 mới phải gọi Figma:

1. `figma_extract.js` với `FRAME_IDS = ['<id>', …]` (3–4 khung một lần với `COMPACT = true` — tiết kiệm lượt gọi mà kết quả vẫn gọn) → ghi kết quả **nguyên văn** ra `reports/design-compare/<run>/figma_<id>.json` (`:` → `-`). Kết quả có `&lt;` `&gt;` là do tool mã hoá — `dc.py` tự giải mã, không cần sửa tay. Khung vẽ **lớp phủ** (menu, dialog) trên nền màn khác → đặt `SCOPE = '<tên khối lớp phủ>'` (rule mục 5)
2. `get_screenshot` (`contentsOnly: true`) → `curl -f -L -o figma_<id>.png "<url>"` ngay (URL hết hạn nhanh). Ảnh trả về tối đa **1×** kích thước khung — đủ cho ảnh đặt cạnh nhau. Khung cao hơn 1024 → truyền `maxDimension` = chiều cao khung, không thì ảnh bị thu nhỏ
3. Cần token (màu thương hiệu, style chữ) → `get_variable_defs` một lần cho cả file, ghi vào đầu báo cáo
4. **Cất vào cache** ngay sau khi có: `dc.py cache put --listing … --cache … figma_<id>.json figma_<id>.png …` — lượt sau (so lại, nền tảng khác cùng khung) không gọi lại Figma cho khung không đổi

**Hết hạn mức ảnh (`get_screenshot` báo *tool call limit*):** spec đã trích vẫn đủ để đo. Dựng ảnh sơ đồ cho phần đặt cạnh nhau:

```bash
python scripts/design-compare/dc.py render figma_<id>.json -o figma_<id>.png     # khối + chữ đúng toạ độ, cỡ, màu — không có icon/ảnh
```

Evidence đặt tên `_figma_render.png`; báo cáo ghi rõ khung nào dùng ảnh dựng lại, mục 5 ghi việc lấy lại ảnh thật ở lần chạy sau.

**Đường dự phòng — khi `use_figma` không chạy được** (bị từ chối quyền, gói Figma không cho phép): `get_metadata` cho khung + toạ độ (node TEXT thường lấy nội dung làm tên; chữ trong instance **không** có), `get_design_context` cho chữ thật (props `label=…`, nội dung thẻ `<p>`) + class màu/cỡ chữ (`text-[15px]`, `text-[color:…,#hex]`). Dựng tay spec JSON cùng định dạng cho các chữ và khối chính, ghi dòng `Nguồn spec: dự phòng (get_metadata + get_design_context)` vào đầu báo cáo. **Không** đoán số đo khi không có trong dữ liệu.

### Bước 3 — Đưa UI thật về đúng trạng thái & thu dữ liệu

Chi tiết theo nền tảng — đọc **đúng một** file:

- App mobile (Android / iOS / Hybrid): [`references/mobile.md`](references/mobile.md)
- Web desktop: [`references/web.md`](references/web.md)
- Mobile web (trình duyệt trên điện thoại): [`references/web.md`](references/web.md) **+ mục 7** — server `playwright-mobile`, không thu hẹp Chrome desktop

Chung cho cả hai: đưa về **cấu hình mặc định** trước khi chụp (cỡ chữ hệ thống, dark mode, màu chủ đề người dùng tự chọn, ngôn ngữ) — ghi lại cấu hình vào báo cáo.

### Bước 4 — Đo

```bash
python scripts/design-compare/dc.py match   figma.json actual.json --actual-top <đỉnh header app> -o reports/design-compare/<run>/<mã>_match
python scripts/design-compare/dc.py visual  figma.png  app.png --design figma.json --actual actual.json --actual-top <đỉnh header app> -o reports/design-compare/<run>/<mã>
```

**Mốc dọc** = đỉnh header ở cả hai phía (rule mục 3): thiết kế tự lấy đáy khối `StatusBar`; app truyền `--actual-top` = y của khối header trong spec app (mobile) — đo một lần, dùng cho mọi khung.

| Tình huống | Thêm tham số |
|---|---|
| Thiết kế có dữ liệu mẫu **ngoài** danh sách lặp (tên trong hộp thoại, giá trong form sửa) | `--sample "Tên sách mẫu" --sample "50.000 ₫"` — chữ đó thành ô động, so khuôn. Danh sách lặp (`UserRow` × 5, thẻ lặp) **tự** nhận, không cần khai |
| Đoạn màn **đã cuộn**, hoặc khung vẽ sẵn ở vị trí đã cuộn | `--auto-offset` (match) · `--match <mã>_match.json` (visual — cắt ảnh Figma theo độ cuộn). Màn **không** cuộn mà vẫn lệch dọc → đó là lệch bố cục, đừng dùng `--auto-offset` để "bù" |
| Bảng đo có dữ liệu người thật (email, số điện thoại, tên người khác) | `--redact "<regex>"` — che trong cả `.md` và `.json` |
| Web | `--tol 2 --de-text 3` (đo tới khung chữ thật, màu đọc trực tiếp) |
| Khung lược bớt | Không cần gì — `match` tự nhận ghi chú *"lược bớt / rút gọn"* và tắt so vị trí |

`match` ghép cặp chữ (nguyên văn → khác ký tự trình bày → khuôn `<…>` (đoán kiểu dữ liệu từ tên: `<email…>`, `<n>`, `<ngày>`…) → tiền tố → chứa nhau → gần giống), rồi đo:

| Cột | Nghĩa | Đọc thế nào |
|---|---|---|
| Δx (neo) | Lệch ngang theo kiểu neo khớp nhất (trái · phải · giữa · tỉ lệ · tâm-…) | Neo `tỉ lệ` mà vẫn lệch → phần tử co giãn sai |
| Δy | Lệch dọc tính từ dưới status bar (hoặc từ đáy với phần tử `neo đáy`) | Lớn mà Δ khoảng cách nhỏ → **kế thừa**, không phải lỗi của phần tử này |
| Δ khoảng cách | Khoảng cách tới phần tử khớp ngay phía trên, app trừ thiết kế | **Đây là cột tìm chỗ khởi phát xô lệch** |
| Δ cao | Chiều cao khung app − khung chữ thiết kế | ≥ 0,6 × line-height → xuống dòng khác |
| Màu · ΔE | Màu thiết kế → màu app (web: computed · mobile: lấy mẫu ảnh) | So ngưỡng rule mục 4 |

Bảng khối (B1, B2…) ghép khối có nền/viền qua chữ bên trong — **heuristic**, phải xem ảnh.

### Bước 5 — Soát trên ảnh → quyết định DIFF

**5a — Lưới soát ngoài → trong** (rule mục 4b). Sinh lưới cho từng khung, mọi đoạn cuộn truyền chung một lệnh:

```bash
python scripts/design-compare/dc.py checklist figma_<id>.json --match <mã>p1_match.json --match <mã>p2_match.json -o reports/design-compare/<run>/<mã>_checklist.md
```

Mở `<mã>_side.png` cạnh lưới, đi **đúng thứ tự** L0 khung màn → L1 vùng → L2 khối → L3 phần tử, mỗi cấp trên → dưới, trái → phải. Mỗi dòng có sẵn thuộc tính thiết kế (font · cỡ · đậm · màu / kích thước) và khoảng cách (margin · padding · gap); cột *Máy đo* có kết quả + độ lệch khoảng cách phía app. Mỗi dòng phải kết thúc bằng ✅ (máy đo, đã liếc ảnh) · ☑ (đã nhìn, khớp) · hoặc mã DIFF — icon, ảnh, bo góc, viền **chỉ** có cột *Soát mắt*. Lưới còn ô ☐ = khung chưa soát xong.

**5b — Đọc bảng đo.** Đi lần lượt từng dòng ❌ ⚠️ 🔍 ➕ ❔ của bảng đo, mỗi dòng trả lời: *thấy bằng mắt không? nguyên nhân thật là gì? thuộc loại nào?*

| Bảng đo báo | Thường là | Xác nhận bằng |
|---|---|---|
| 🔍 Thiếu trên app | Thật sự thiếu · **hoặc** app thay bằng ảnh/icon (chữ "A" của avatar thành ảnh) · **hoặc** trạng thái thoáng qua chưa tái tạo (toast) | Ảnh đặt cạnh nhau |
| ➕ Thừa trên app | Thật sự thừa (khối thiết kế chưa vẽ) · hoặc chữ nằm dưới thanh điều hướng/bị che | Cuộn xem; ảnh app |
| ❔ chung node | WebView gộp chữ (`User mgttotal: 3294 users`) — chữ **có**, chỉ không đo tự động được | Nhìn ảnh: vị trí/màu có lệch thấy rõ không |
| ❌ Δy ở phần tử đầu | Nguyên nhân thường ở khối **không có chữ** phía trên (banner, ảnh, header cao hơn) | Ảnh: khối nào cao hơn → DIFF ghi cho **khối đó** |
| ⚠️/❌ màu ở khối | Thiết kế nền phẳng, app nền gradient/đổ bóng — lấy mẫu một điểm không đại diện | Ảnh; wireframe thì chỉ ghi "tham khảo" |
| ❌ chữ `<mẫu:…>` "khác nội dung" | Dữ liệu thật khác **hình dạng** mẫu (tên có chữ số) — không phải lệch · **hoặc** app bỏ trống đúng chỗ dữ liệu (`delete , after…`) — lệch thật | Đọc cột *Trên app*: còn phần cố định của câu mà thiếu dữ liệu → DIFF |
| 🔍 dấu `/` breadcrumb, chữ trong nút chỉ có icon | Dấu phân cách / icon vẽ bằng ảnh trên app — không có node chữ | Ảnh; không phải DIFF |
| 🔍 ở khung lược bớt | Phần tử có thể nằm ngoài đoạn đã chụp (không suy được vị trí khi tắt so hình học) | Cuộn chụp thêm trước khi kết luận thiếu |
| ❌ Δx rất lớn, phần tử app ở x gần bề ngang màn | Bảng / hàng nút rộng hơn màn, cuộn ngang → phần tử **khuất** | Ảnh: có nhìn thấy không? Không → DIFF `LAYOUT` (rule mục 5) |
| Cùng lệch đã có mã ở module khác | Thành phần dùng chung (header, bottom nav, ô nhập, nút hộp thoại) | Dẫn chiếu mã cũ, **không** cấp mã mới (rule mục 6) |

**Những thứ máy không đo** — đã có dòng trong lưới soát, nhắc lại để nhìn đúng chỗ:

- [ ] Icon: đúng hình, đúng chỗ, đủ số lượng (wireframe: chỉ có/không)
- [ ] Ảnh/banner: có, đúng tỉ lệ khung, không méo, không vỡ
- [ ] Bo góc, viền, đường phân cách, đổ bóng (mockup)
- [ ] Chữ bị cắt `…`, tràn khung, chồng lên nhau
- [ ] Phần tử bị che (bởi bàn phím, bottom nav, status bar)
- [ ] Trạng thái: nút disabled/enabled, ô nhập focus/lỗi — đúng như khung vẽ
- [ ] Thứ tự đọc và căn lề tổng thể của khối

**5c — Tra DIFF đã có trước khi cấp mã.** Mỗi dòng xác nhận lệch thật → một `DIFF`. Nhiều dòng cùng **một nguyên nhân** → **một** DIFF (VD 5 tab bottom nav cùng lệch −6,8 do thanh cao hơn = 1 DIFF cho thanh). Trước khi cấp mã nối tiếp, tra theo thứ tự:

1. Lượt trước của **cùng** module × nền tảng × biến thể → còn lệch thì giữ mã (rule mục 6 — vòng đời)
2. **Sổ khung Figma** trong danh mục → cùng node-id khung đã có DIFF ở **nền tảng / biến thể khác** (mobile web ↔ app, desktop ↔ mobile web) → chung mã nguồn giao diện: dùng lại mã, thêm nền tảng · khác mã nguồn: mã mới + cột *Liên quan* (rule mục 6 — *một lệch, không log trùng*)
3. Bảng **Thành phần dùng chung** → lệch ở header, bottom nav, ô nhập… đã có mã ở module khác: dẫn chiếu

**5d — Ảnh khoanh đúng / sai** (rule mục 7) — mỗi khung có DIFF một ảnh `_marked.png`: Figma | App cạnh nhau, khung **xanh** bên Figma = đúng, khung **đỏ** bên App = sai, cùng số, dải ghi chú *Thiết kế (đúng) / Thực tế (sai)* bên dưới. Viết spec JSON (ghi chú viết theo *Viết một DIFF* bên dưới — không toạ độ):

```json
{"title": "B-07 · Chọn khuyến mãi",
 "items": [{"diff": "DIFF-BK-BOOK-07", "title": "Bảng khuyến mãi tràn ngang, cột Name bị cắt",
            "figma": {"box": "B2"}, "app": {"box": "B2"},
            "expected": "Bảng nằm gọn trong thẻ; cột CODE rộng 118 dp, cột Name hiện đủ tên + mô tả",
            "actual": "Cột CODE rộng 219 dp đẩy cột Name ra mép phải — tên bị cắt, mô tả xuống 3 dòng"},
           {"diff": "DIFF-BK-BOOK-12", "title": "Thiếu ô tìm kiếm", "figma": {"text": "^Search"}, "app": null,
            "expected": "Ô Search… phía trên bảng", "actual": "Không có ô tìm kiếm"}]}
```

```bash
python scripts/design-compare/dc.py mark figma_<id>.png <mã>_app.png --design figma_<id>.json --actual <mã>_actual.json \
       --match <mã>_match.json --spec <mã>_marks.json -o evidence/<mã>_<mô_tả>_marked.png
```

| Đích (`figma` / `app`) | Khi nào |
|---|---|
| `{"text": "<regex>"}` | Phần tử có chữ — lấy phần tử nhỏ nhất khớp; thêm `"all": true` để gộp mọi phần tử khớp (5 tab bottom nav) |
| `{"row": 6}` · `{"box": "B2"}` | Theo dòng / khối của bảng đo (cần `--match`) — hai phía tự lấy đúng cặp đã ghép |
| `{"name": "<regex>"}` | Khối / icon / ảnh theo tên (Figma: tên layer · app: `resource-id` / class) |
| `{"rect": [x, y, w, h]}` | Vùng không có chữ (khoảng trống, banner) — đơn vị của phía đó |
| `[đích, đích, …]` | Gộp khung của nhiều đích |
| `"app": null` | App **thiếu** → khung đỏ nét đứt ở chỗ đáng lẽ có (neo theo phần tử khớp gần nhất phía trên) |
| `"figma": null` | Thiết kế không có (`EXTRA`) → chỉ khoanh bên App |

Không thấy đích nào → lệnh **dừng**, không khoanh bừa. Đoạn đã cuộn: truyền `--match` của đoạn đó (cắt ảnh Figma đúng độ cuộn). **Mở lại ảnh**: khung xanh và đỏ cùng số phải là **cùng một phần tử**. Ảnh đã che dữ liệu thì truyền ảnh **đã che** làm `<mã>_app.png`.

`dc.py annotate` (chỉ khoanh bên App) vẫn còn cho việc riêng — VD đánh dấu vùng đã che — nhưng **không** đủ làm evidence của DIFF.

### Bước 6 — Ghi báo cáo

**Chọn mẫu báo cáo:** project có `plans/design-compare/report_template.md` (mẫu riêng của team — tự tạo bằng cách chép [`references/report_template.md`](references/report_template.md) rồi sửa) → dùng mẫu đó; không có → dùng [`references/report_template.md`](references/report_template.md). Mẫu riêng được đổi tên mục, thêm/bớt dòng thông tin, thêm cột, đổi văn phong — nhưng phải giữ **hợp đồng tối thiểu** ghi trong mẫu chuẩn (mục *Mẫu riêng của team*): viewer, `/create-bug-report` và lượt *So lại* đọc theo các tên đó. Mẫu riêng bỏ mất phần bắt buộc → báo user một câu, vẫn ghi phần đó ở cuối báo cáo.

Ghi `docs/design-reviews/<module>/<nền-tảng>/run_<YYYYMMDD_HHMMSS>/design_compare_report.md` + `evidence/`. Cập nhật danh mục `docs/design-reviews/README.md`: dòng module × nền tảng × biến thể (DIFF đã dùng · mã kế tiếp · DIFF mở) · bảng *Nền tảng & biến thể* · **Sổ khung Figma** (node-id → nền tảng đã so → DIFF mở) · bảng *Thành phần dùng chung*.

Mục 4 *Chi tiết từng khung* dán bảng đo của **mọi** đoạn chụp và **lưới soát** đã tick — sinh bằng `dc.py sections frames.json -o sections.md` (mỗi khung: tiêu đề · ghi chú · ảnh · các `<mã>_match.md` · `<mã>_checklist.md` · regex che dữ liệu), đừng chép tay. Trước khi ghi `docs/`:

- [ ] Ảnh có dữ liệu người khác → `dc.py mask` (ảnh `_app`, rồi dựng lại `_side` **từ ảnh đã che**); bảng đo → `match --redact`. Mở lại vùng đã che
- [ ] Mọi link `evidence/…` trong báo cáo trỏ tới file có thật
- [ ] Lệch đã có mã ở module khác → dẫn chiếu, không cấp mã mới
- [ ] Lệch đã có mã ở nền tảng / biến thể khác cùng khung Figma → dùng lại mã (chung mã nguồn) hoặc ghi *Liên quan*
- [ ] Mọi DIFF có ảnh `_marked.png` khoanh đúng / sai hai phía; lưới soát của mọi khung không còn ô ☐

---

## Viết một DIFF

```markdown
| Mã | Trạng thái | Nền tảng | Khung | Loại | Mức độ | Ai xử lý | Mô tả | Thực tế | Thiết kế | Liên quan | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DIFF-BK-BOOK-11 | 🔴 Mở | Android | B-09 | CONTENT | Medium | Dev | Câu xác nhận xoá **thiếu tên sách** — người dùng không biết đang xoá sách nào | `Do you want delete , after delete you can't undo` | `Do you want delete <tên sách>, after delete you can't undo` | — | [side](evidence/B-09_delete_book_confirm_side.png) · [marked](evidence/B-09_delete_book_confirm_marked.png) |
| DIFF-SHOP-CART-04 | 🔴 Mở | Mobile web · Android | C-02 | LAYOUT | Low | Dev | Menu **Sort By** hẹp hơn và dính sát mép phải màn hình (app Hybrid chung frontend với mobile web → một mã) | Rộng **160 dp** · cách mép phải **0 dp** | Rộng **220 dp** · cách mép phải **16 dp** | — | [marked](evidence/C-02_cart_sort_menu_marked.png) |
| DIFF-SHOP-CART-07 | 🔴 Mở | iOS | C-03 | LAYOUT | Medium | Dev | Gap giữa ô **Mã giảm giá** và nút **Thanh toán** rộng hơn thiết kế | Gap **25 pt** | Gap **18 pt** | `DIFF-SHOP-CART-03` (Android — app native, sửa riêng) | [marked](evidence/C-03_checkout_marked.png) |
```

Ô **Thực tế** và **Thiết kế** ghi **số đo** hoặc **nguyên văn chữ**, không ghi "trông hơi to" — và **không** ghi toạ độ thô (`x 272`, `Δy +15`): dùng kích thước + margin / padding / gap như rule mục 6 *Viết DIFF cho người không đọc toạ độ* (dịch `Δx` của bảng đo thành *"cách mép trái 32 dp, thiết kế 16 dp"*, `Δ khoảng cách` thành *"gap tới … 25 dp, thiết kế 18 dp"*). Gọi phần tử bằng chữ / vai trò người dùng nhìn thấy, không bằng `B2` hay số dòng bảng đo. Cột **Nền tảng** liệt kê mọi nền tảng / biến thể đã thấy lệch này (DIFF dùng lại ở nền tảng chung mã nguồn); cột **Liên quan** trỏ mã cùng lệch ở nền tảng khác mã nguồn. Ô **Mô tả** nói hậu quả với người dùng khi có (*"không biết đang xoá sách nào"*) — đó là thứ giúp PO xếp ưu tiên. Nguyên nhân chỉ ghi khi đã xác định trên ảnh/số đo; chưa rõ thì thôi — không suy diễn code của dev. DIFF hành vi giao `Dev` ghi thêm các bước tái hiện + `tái hiện n/n lần`.

---

## Bẫy đã gặp

| Bẫy | Hậu quả | Cách tránh |
|---|---|---|
| `get_metadata` không `nodeId` chỉ liệt kê page đã tải | Tưởng file chỉ có 1 page | Liệt kê bằng `figma_extract.js` (`FRAME_IDS = []`) |
| Chữ trong instance không có trong `get_metadata` | Bỏ sót chữ của nút, ô nhập | Dùng `figma_extract.js` |
| Bounds mobile là khung phần tử, không phải khung chữ | Báo "khác số dòng" giả, Δx lệch | `dc.py` nhận diện khung chứa → so tâm; vẫn phải xem ảnh |
| WebView gộp chữ con không có khoảng trắng | Thiếu/không khớp giả | `dc.py` khớp kiểu "chứa"; xác nhận trên ảnh |
| Lấy status bar làm mốc dọc (thiết kế 36 · thật 53 dp, app lại vẽ header ở 40 dp) | Mọi Δy lệch giả cùng một lượng | Mốc = đỉnh header cả hai phía (`--actual-top`) |
| Menu/dialog mở → cây phần tử chỉ còn lớp phủ | Cả màn nền báo "thiếu" | `SCOPE` trong `figma_extract.js` — so riêng lớp phủ |
| Một khung Figma vẽ hai trạng thái không cùng lúc | Không bao giờ tái tạo được khung | Tái tạo từng trạng thái, DIFF `STATE` cho thiết kế |
| Toast biến khỏi cây phần tử sau ~2 giây | Không đo được bằng page source | Ảnh chụp ngay là bằng chứng, đo vị trí trên ảnh |
| Form giữ giá trị cũ khi quay lại màn | Chữ nhập mới bị nối vào sau, trạng thái sai | Xoá ô trước khi nhập (`appium_set_value` thay toàn bộ) |
| `get_screenshot` khung cao > 1024 | Ảnh Figma bị thu nhỏ, ảnh đặt cạnh nhau lệch tỉ lệ | `maxDimension` = chiều cao khung |
| So khung "có toast" lúc toast đã tắt | DIFF "thiếu" giả | Tái tạo hành động rồi chụp ngay; không kịp → ❔ |
| Phần trang dưới màn đầu không có trong khung Figma (khung cố định một màn) | Bỏ sót cả khối chức năng app có mà thiết kế không vẽ | Luôn **cuộn hết** màn thật một lượt dù khung Figma không ghi "full scroll" |
| Màn thật rộng hơn khung | Phần bên phải lệch toàn bộ trên ảnh chồng | Đọc ảnh đặt cạnh nhau, không đọc ảnh chồng; tin cột Δx (neo) |
| Ảnh chụp sai trạng thái (menu chưa mở, dữ liệu chưa tải) | Cả màn DIFF giả | Mở lại ảnh app trước khi đo |
| Hết hạn mức gọi Figma MCP giữa phiên | Mất ảnh các khung còn lại | Trích + lấy ảnh mọi khung ngay đầu phiên; hết rồi → `dc.py render` |
| `visual --match` cho đoạn **không** cuộn | Ảnh Figma bị cắt sai chỗ, đặt cạnh nhau lệch hẳn | Chỉ truyền `--match` cho đoạn đã cuộn |
| Thông báo lỗi của form trước còn ở form sau (Add → Update) | Khung "form sạch" chụp ra trạng thái lỗi — tưởng DIFF thiết kế | Vào mỗi khung form từ trạng thái sạch; thấy lỗi dính → tái hiện riêng — có thể là **lỗi app thật** |
| Dữ liệu người dùng khác trong danh sách / chi tiết | Lộ email, tên thật vào `docs/` qua ảnh **và** bảng đo | `mask` + `--redact` (Bước 6) |
| Ảnh evidence chỉ khoanh bên App, nhãn chỉ có mã DIFF | Người nhận mở ảnh không biết đúng phải trông thế nào, đọc DIFF thì gặp toạ độ — *"học hơi lú"* | `dc.py mark`: Figma xanh / App đỏ cùng số + ghi chú Thiết kế / Thực tế (Bước 5d) |
| Mô tả DIFF chép thẳng `x 272`, `Δy +15` từ bảng đo | Dev/PO không dịch được ra phần tử nào, lệch kiểu gì | Viết bằng margin / padding / gap / kích thước + tên phần tử nhìn thấy (rule mục 6) |
| Soát ảnh theo cảm hứng, chỉ đi các dòng ❌ của bảng đo | Sót icon, ảnh, khoảng cách giữa khối, lề trong thẻ — bảng đo không có dòng nào cho chúng | Lưới soát `dc.py checklist` đi ngoài → trong, mỗi dòng phải có kết quả (Bước 5a) |
| Chạy app sau mobile web (chung khung Figma) mà không tra lượt trước | Log trùng lệch đã có, không ai biết hai mã là một | Tra *Sổ khung Figma* trước khi cấp mã (Bước 5c) |
| Mobile web bằng Chrome desktop thu hẹp, hoặc giả lập CDP trong server `playwright` chính | Trang ở layout desktop (UA, không cảm ứng); CDP bị lệnh chụp ảnh đặt lại về 1600 px mà không báo lỗi | Server `playwright-mobile` (`web.md` mục 7) |
| Mỗi lượt so lại đều trích + chụp lại mọi khung Figma | Hết hạn mức gói Starter giữa phiên | `dc.py cache plan / get / put` theo dấu vân tay khung (Bước 1–2) |

---

## Tham chiếu

| File | Khi nào đọc |
|---|---|
| [`references/mobile.md`](references/mobile.md) | Bước 3 — mode MOBILE |
| [`references/web.md`](references/web.md) | Bước 3 — mode WEB · mode MOBILE-WEB (mục 7) |
| `plans/design-compare/report_template.md` (nếu project có) | Bước 6 — mẫu báo cáo riêng của team, thay mẫu chuẩn |
| [`references/report_template.md`](references/report_template.md) | Bước 6 |
| [`.claude/rules/design_compare_rules.md`](../../rules/design_compare_rules.md) | Trước Bước 4 — dung sai, phân loại |
| [`scripts/design-compare/README.md`](../../../scripts/design-compare/README.md) | Tham số đầy đủ của `dc.py` |
