# Mode WEB · MOBILE-WEB — thu dữ liệu UI thật trên trình duyệt

> Bước 3 của skill. Mode **MOBILE-WEB** (trình duyệt trên điện thoại) dùng chung mục 2–6 và đọc thêm **mục 7**. Quy tắc trình duyệt: [`playwright_rules.md`](../../../rules/playwright_rules.md) · CLAUDE.md mục Browser Rules.
>
> Web đo được **nhiều hơn** mobile: `collect_dom.js` đọc computed style (cỡ chữ, độ đậm, font thực sự được vẽ, màu chính xác) và khung chữ thật (ink box). Đổi lại, web có nhiều **biến** hơn: breakpoint, font tải chậm, thanh cuộn, nội dung tải lười, animation. Mục 1–3 là để khử các biến đó **trước** khi đo.

---

## 1. Ghép khung Figma với bề ngang trình duyệt

Khung Figma web thường rộng 1440 / 1280 / 1024 / 768 / 375–430. Mỗi bề ngang là **một layout** (responsive) — so khác bề ngang là so hai layout khác nhau.

**Bước 1a — lập bảng breakpoint** ngay ở Bản đồ màn hình: cùng một màn có mấy khung, mỗi khung rộng bao nhiêu.

| Màn | Khung Figma | Bề ngang | So ở |
|---|---|---|---|
| Đăng nhập | `Login — Desktop` | 1440 | viewport 1440 (headed được, ≤ cửa sổ) |
| Đăng nhập | `Login — Mobile` | 375 | viewport 375 (mobile web — **không** phải thiết bị thật) |

**Bước 1b — đặt viewport** theo bảng:

| Bề ngang khung | Cách đặt |
|---|---|
| ≤ cửa sổ headed (mặc định `1600×750`) | `browser_resize` về `<bề ngang khung> × 750` — **thu nhỏ** viewport trong cửa sổ là được phép |
| > cửa sổ headed (VD 1920) | **Không** `browser_resize` vượt cửa sổ (trang bị cắt, rule mục 8). Hai đường: (a) chạy Playwright **headless** ở đúng bề ngang — một script ngắn: `page.setViewportSize`, `page.evaluate(<collect_dom.js>)`, `page.screenshot({fullPage:true})`; (b) so ở 1600 và ghi giới hạn vào báo cáo — phần tử co giãn được `dc.py` neo theo tỉ lệ, phần tử đổi layout theo breakpoint thì **không** so được |
| Mobile web (≤ 430) | **Mode MOBILE-WEB** — mục 7. Không thu hẹp Chrome desktop: trang responsive chọn layout theo UA / cảm ứng / `pointer: coarse`, không chỉ theo bề ngang |

**Thanh cuộn dọc ăn bề ngang.** Viewport 1440 trên Windows chỉ còn ~1425 px cho nội dung; Figma không vẽ thanh cuộn. `collect_dom.js` lấy bề ngang khung bằng `clientWidth` (đã trừ thanh cuộn) để phép neo phải/giữa đúng — dòng *Môi trường* ghi số này. Lệch ~15 px ở phần tử neo phải mà ảnh vẫn đúng → nguyên nhân là thanh cuộn, không phải DIFF.

Xong việc → `browser_resize` trả lại `1600×750`.

---

## 2. Khử biến trước khi đo

Chạy **một lần** sau khi trang tải xong, trước mỗi lượt đo:

```js
// browser_evaluate — chờ font, tắt animation/caret, ép ảnh tải lười hiện ra, về đầu trang
async () => {
  await document.fonts.ready;
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}';
  document.head.appendChild(st);
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); }
  scrollTo(0, 0);
  return [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family);
}
```

| Biến | Vì sao phải khử | Cách |
|---|---|---|
| Font chưa tải | Font dự phòng làm sai **mọi** số đo chữ | `document.fonts.ready`; danh sách font đã tải ghi vào báo cáo. Font thiết kế không có trong danh sách → DIFF `STYLE` (font không tải / thiếu) |
| Animation, transition, con trỏ nhấp nháy | Ảnh chụp giữa chừng hiệu ứng | CSS tắt hiệu ứng ở trên — chỉ ảnh hưởng **lượt đo**, không phải so thiết kế animation |
| Ảnh / khối tải lười (lazy) | Ảnh full-page có ô trống | Cuộn hết trang một lượt rồi về đầu |
| Carousel / banner xoay | Mỗi lần chụp một slide | Đưa về slide khớp khung Figma (bấm chấm điều hướng) rồi mới đo |
| Dữ liệu động (giờ, số đếm, tên người) | Khác thiết kế mỗi lần | Khung Figma dùng `<…>` hoặc dữ liệu mẫu → `--sample` (rule mục 5) |
| Popup cookie / thông báo | Che nội dung | Đóng theo lựa chọn **ít chia sẻ dữ liệu nhất** (từ chối không bắt buộc), ghi vào báo cáo |

Thử nghiệm A/B, feature flag, ngôn ngữ trình duyệt: ghi giá trị đang dùng vào *Môi trường* — đổi một trong các thứ này là đổi giao diện.

---

## 3. Đưa trang về đúng trạng thái

- Điều hướng theo Screen Map; thao tác bằng locator từ `browser_snapshot` (không bấm toạ độ)
- **Đăng nhập:** tài khoản test từ `.env`. Mật khẩu gõ qua tool sẽ nằm trong log của phiên → ưu tiên **đăng nhập một lần** (tester gõ, hoặc agent gõ một lần đầu phiên) rồi giữ phiên trình duyệt cho mọi khung; không gõ lại ở từng khung
- **Trạng thái tương tác** — mỗi trạng thái Figma vẽ là một lượt đo riêng:

| Trạng thái | Tạo bằng |
|---|---|
| hover | `browser_hover` vào phần tử, đo **ngay** (rời chuột là mất) |
| focus | `browser_click` vào ô (hoặc `Tab` tới) |
| lỗi validation | submit khi trống / nhập sai đúng như khung mô tả |
| disabled / loading | Đưa form về điều kiện làm nút disabled; loading: giữ request lại bằng `page.route` trong `browser_run_code_unsafe` nếu cần chụp trạng thái chờ |
| rỗng (*No data*) | Bộ lọc / từ khoá không khớp — **không** xoá dữ liệu thật |

- **Lớp phủ** (dialog, menu, dropdown, toast): mở ra rồi đo **riêng vùng đó** — đặt `ROOT_SELECTOR` trong `collect_dom.js`, toạ độ tính từ góc lớp phủ, so với khung Figma trích bằng `SCOPE`. Thư viện UI (MUI, Ant, Radix) render lớp phủ ở **portal cuối `<body>`**, không nằm trong khối chứa nút mở — chọn theo vai trò: `'[role=dialog]'`, `'[role=menu]'`, `'[role=listbox]'`, `'.MuiPopover-paper'`
- Không bao giờ bấm *Lưu* / *Xoá* thật trên môi trường dùng chung để có trạng thái (rule mục 8)

---

## 4. Thu spec + ảnh

```
browser_evaluate(function = <toàn bộ nội dung collect_dom.js>, filename = "reports/design-compare/<run>/<mã>_actual.json")
browser_take_screenshot(fullPage = true, scale = "css", filename = "reports/design-compare/<run>/<mã>_app.png")
```

- `filename` của `browser_evaluate` ghi kết quả **thẳng ra file** — không chép JSON qua ngữ cảnh (trang thật có hàng trăm node)
- Ảnh `scale: "css"` → 1 pixel ảnh = 1 CSS px, khớp đơn vị Figma (`dc.py visual` tự tính tỉ lệ từ bề ngang ảnh và spec)
- Toạ độ trong spec tính từ **đầu tài liệu** (đã cộng scroll) → khung Figma "toàn trang" so thẳng, **không** cần `--auto-offset`
- Header/footer `position: fixed | sticky`: ảnh full-page có thể lặp/che — so khung đó bằng ảnh viewport (`fullPage: false`) ở đầu trang
- Spec ghi thêm: `overflow_x` (> 0 = trang **tràn ngang** — thiết kế không có → DIFF `LAYOUT`) · `cut: true` ở chữ bị cắt `…` (thiết kế hiện đủ chữ → DIFF)
- Trang có dữ liệu người dùng khác → che trên ảnh bằng `dc.py mask app.png --actual <mã>_actual.json --pattern "<regex>"`, bảng đo bằng `match --redact` (rule mục 7)

---

## 5. Đo

```bash
python scripts/design-compare/dc.py match  figma_<id>.json <mã>_actual.json --tol 2 --de-text 3 -o <run>/<mã>_match
python scripts/design-compare/dc.py visual figma_<id>.png  <mã>_app.png --design figma_<id>.json --actual <mã>_actual.json -o <run>/<mã>
```

Web không có status bar → **không** cần `--design-top` / `--actual-top`, trừ khi khung Figma có vẽ thanh trình duyệt / thanh trạng thái giả (khi đó `--design-top` = đáy khối đó).

| Web đo được mà mobile không | Đọc thế nào |
|---|---|
| Cỡ chữ, độ đậm (computed) | Lệch 1 px là **số đo thật**, không phải sai số |
| Font thực sự được vẽ (`collect_dom.js` dò font đầu tiên trong stack có trên máy) | Khác font thiết kế → kiểm danh sách font đã tải (mục 2). Font hệ thống thay font web = font web không tải |
| Màu chữ chính xác | Ngưỡng màu nền: `--de-text 3` (không có nhiễu khử răng cưa) |
| Khung chữ thật (ink box) | Dung sai vị trí chặt: `--tol 2` |

---

## 6. Đặc thù web phải soát tay

- [ ] **Mọi** bề ngang ở bảng breakpoint đã so — thiết kế có bản desktop + mobile mà chỉ so một bản là bỏ nửa phạm vi
- [ ] Trạng thái hover / focus / active của nút, link (thiết kế có vẽ)
- [ ] Tràn ngang (`overflow_x > 0`) và chữ bị cắt `…` (`cut`)
- [ ] Ảnh `object-fit` sai (méo/cắt), ảnh vỡ (`naturalWidth = 0`)
- [ ] Focus ring / outline (a11y) — thiết kế bỏ trống thì **không** ghi DIFF bắt dev xoá outline
- [ ] Favicon, tiêu đề tab — chỉ khi thiết kế quy định

---

## 7. Mobile web — Mode `MOBILE-WEB`

Trình duyệt trên điện thoại khác Chrome desktop thu hẹp ở 4 chỗ trang web **đọc được**: user agent mobile · `navigator.maxTouchPoints` / `pointer: coarse` · `devicePixelRatio` · không có thanh cuộn chiếm bề ngang. Trang responsive (Bootstrap, MUI, Tailwind có `hover:` / `pointer:`) chọn menu, kích thước nút, hover… theo các thứ này → so bằng Chrome desktop thu hẹp là so một layout **không người dùng nào thấy**.

### 7.1 Dùng server MCP `playwright-mobile`

`.mcp.json` khai sẵn server thứ hai chạy `--device` (giả lập thiết bị của Playwright: UA, cảm ứng, DPR, viewport) + `--isolated` (profile riêng — không khoá chung profile với server `playwright`). Tool của nó mang tiền tố `mcp__playwright-mobile__browser_*`, dùng y hệt mode WEB (mục 2–5):

```
mcp__playwright-mobile__browser_navigate(url)
mcp__playwright-mobile__browser_resize(<bề ngang khung Figma> × <cao>)   ← vẫn giữ UA / cảm ứng / DPR của thiết bị; thu nhỏ trong cửa sổ là được phép
mcp__playwright-mobile__browser_evaluate(probe) → kiểm: innerWidth = bề ngang khung · clientWidth = innerWidth (không thanh cuộn) · pointer: coarse = true
```

```js
// browser_evaluate — kiểm đúng chế độ mobile TRƯỚC khi đo, ghi kết quả vào ô Môi trường
() => ({ w: innerWidth, cw: document.documentElement.clientWidth, dpr: devicePixelRatio,
         touch: navigator.maxTouchPoints, coarse: matchMedia('(pointer: coarse)').matches, ua: navigator.userAgent })
```

| Việc | Cách |
|---|---|
| Đổi thiết bị mặc định (`Pixel 7`) | Sửa `--device` trong `.mcp.json` (tên theo danh sách thiết bị của Playwright: `"iPhone 15"`, `"Galaxy S24"`…), **khởi động lại Claude Code**. Thiết bị chỉ quyết định UA / DPR / kiểu engine giả lập; bề ngang chỉnh bằng `browser_resize` theo khung Figma |
| Server chưa có trong phiên (chưa khởi động lại sau khi thêm) | Báo user khởi động lại — **không** tự thay bằng cách dưới |
| Đăng nhập | Profile `--isolated` không giữ phiên giữa các lần mở → đăng nhập một lần đầu phiên (mục 3) |
| Ảnh | `browser_take_screenshot(scale = "css")` → 1 px ảnh = 1 CSS px, khớp đơn vị Figma — **không** dùng `scale: "device"` (ảnh ×DPR, `dc.py` sẽ tính sai tỉ lệ nếu spec ghi CSS px) |

Kiểm chứng 26-10-2026 (`@playwright/mcp --device "Pixel 7"`): UA Android, `maxTouchPoints` 5, `pointer: coarse`, DPR 2,625 giữ nguyên sau `browser_take_screenshot` và sau `browser_resize` 390×844 → ảnh 390 px rộng, `clientWidth` 390.

### 7.2 Bẫy: giả lập bằng CDP trong server `playwright` chính

`browser_run_code_unsafe` + `Emulation.setDeviceMetricsOverride` / `setUserAgentOverride` trông như chạy được (`innerWidth` báo 390) — nhưng **lệnh chụp ảnh của Playwright đặt lại viewport desktop**: ảnh ra layout 1600 px, sau đó `innerWidth` cũng về 1600. Không có lỗi nào báo. **Không** dùng cách này (rule mục 8).

### 7.3 Máy thật (Chrome Android / Safari iOS) — chỉ để xác nhận bằng mắt

Cần đúng engine của máy (font hệ thống, cách Safari vẽ form, thanh địa chỉ co giãn): mở trình duyệt trên thiết bị qua Appium (`browserName: Chrome` / `Safari` — skill `skills-mobile-debug-agent`). appium-mcp **không** chạy được JS trong trang → không có `collect_dom.js`, không có số đo font/màu. Dùng ảnh máy thật để **đặt cạnh** ảnh Figma và soát mắt; số đo lấy từ `playwright-mobile`. Báo cáo ghi rõ ảnh nào từ máy thật.

### 7.4 Ghi vào đâu

- Thư mục: `docs/design-reviews/<module>/web/run_<…>/` (tầng nền tảng chỉ có `web` · `mobile` · `api`) — ô **Biến thể** ở đầu báo cáo: `Mobile web — <thiết bị> · <bề ngang>`
- Danh mục: một dòng riêng cho `web` × `Mobile web` (khác dòng `web` × `Desktop`) — *So lại* tìm lượt chạy gần nhất theo cặp nền tảng × biến thể
- Khung Figma dùng chung với app → tra *Sổ khung Figma* trước khi cấp mã (rule mục 6 — *một lệch, không log trùng*)
