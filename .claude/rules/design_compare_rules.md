# Quy Tắc So Thiết Kế Figma Với UI Thật (Design Compare)

> Áp dụng cho mọi tác vụ đối chiếu bản thiết kế (Figma) với giao diện đã xây dựng — **web** (Playwright MCP), **mobile web** (Playwright MCP giả lập thiết bị — server `playwright-mobile`) và **app mobile** (Appium MCP).
>
> Quy trình: workflow [`/compare-ui-from-figma-design`](../skills/compare-ui-from-figma-design/SKILL.md) · phương pháp: skill [`skills-figma-design-comparator`](../skills/skills-figma-design-comparator/SKILL.md) · công cụ: [`scripts/design-compare/`](../../scripts/design-compare/README.md).

---

## 1. Nguyên tắc gốc

| # | Nguyên tắc | Vì sao |
|---|---|---|
| 1 | **Figma không mặc nhiên đúng.** Đầu ra là **danh sách chỗ lệch (`DIFF`)**, mỗi chỗ có người quyết bên nào sửa — không phải PASS/FAIL cho cả màn hình | Thiết kế có thể lỗi thời, thiếu trạng thái, hoặc mâu thuẫn requirements. Coi Figma là chuẩn tuyệt đối thì bug report sẽ bắt dev sửa theo bản vẽ sai |
| 2 | **Đo trước, kết luận sau.** Số đo (toạ độ, màu, chữ) lấy từ nguồn máy đọc được; người soát **mở ảnh đặt cạnh nhau** rồi mới ghi `DIFF` | Bảng so khớp tự động có dương tính giả (WebView gộp chữ, khung phần tử lớn hơn chữ). Ghi thẳng bảng tự động thành bug là đẩy rác cho dev |
| 3 | **Không kết luận bằng % pixel giống nhau** | Màn thật rộng khác khung Figma, chữ render khác, dữ liệu động khác — % giống 82 % hay 95 % không nói lên chỗ nào sai. Ảnh chồng / bản đồ khác biệt chỉ để **người nhìn** |
| 4 | **Chỉ đọc Figma.** Tool `use_figma` chỉ chạy script trích dữ liệu, **cấm** tạo/sửa/xoá node | File thiết kế là tài sản của team design; đổi một node là đổi luôn nguồn so sánh |
| 5 | **So đúng trạng thái.** Khung Figma vẽ trạng thái nào (rỗng, lỗi validation, đã đăng nhập, có toast…) thì app phải được đưa về **đúng** trạng thái đó trước khi chụp | So khung "lỗi validation" với form trống sẽ ra hàng chục DIFF giả |

---

## 2. Khai báo độ trung thực của thiết kế — TRƯỚC khi so

Ghi ở đầu báo cáo. Mức độ trung thực quyết định **cái gì được tính là DIFF**:

| Mức | Nhận biết | So những gì | Không tính DIFF |
|---|---|---|---|
| **Wireframe** | Ảnh/banner là khung giữ chỗ (icon ảnh + chú thích), icon nét đơn giản, ghi chú "wireframe" | Nội dung chữ · có/thiếu phần tử · thứ tự · bố cục khối · trạng thái · hành động có trên màn hình | Màu nền, gradient, đổ bóng, ảnh thật, kiểu icon → ghi **"tham khảo"**, không thành DIFF |
| **Mockup (hi-fi)** | Màu, ảnh, icon, font hoàn chỉnh; có style/variable | Tất cả của wireframe **+** màu · font · cỡ chữ · độ đậm · khoảng cách · bo góc theo dung sai mục 4 | — |
| **Prototype** | Có luồng nối màn (interaction) | Như mockup **+** điều hướng giữa các màn | Hiệu ứng chuyển cảnh (animation) |

Không chắc mức nào → **hỏi user một câu**, không tự đoán. Khung Figma tự ghi chú mức độ (trang tiêu đề, note) thì dùng luôn.

---

## 3. Đơn vị & quy đổi

Đơn vị Figma **= dp (Android) = pt (iOS) = CSS px (web)**. Luôn so trong đơn vị này, **không** so pixel ảnh chụp.

| Nền tảng | Quy đổi | Lấy thông số ở đâu |
|---|---|---|
| Android | `dp = px ÷ (density / 160)` | `adb shell wm density` · `adb shell wm size` |
| iOS | `pt = px ÷ scale` (2 hoặc 3) | Page source XCUITest đã ở **pt** — không cần quy đổi toạ độ |
| Web | CSS px (bỏ qua `devicePixelRatio`) | `getBoundingClientRect()` |
| Mobile web (trình duyệt trên điện thoại) | CSS px của viewport thiết bị giả lập (bỏ qua `devicePixelRatio`) | `getBoundingClientRect()` trên server MCP **`playwright-mobile`** (`--device`) — có UA mobile, cảm ứng, DPR thật. **Không** phải Chrome desktop thu hẹp cửa sổ (`web.md` mục 7) |

**Màn thật rộng khác khung Figma** (VD khung 412, máy 448 dp; khung 1440, màn 1600 px) là chuyện thường. Không phóng ảnh cho khớp rồi so — so từng phần tử theo **kiểu neo**: neo trái giữ `x`, neo phải dịch theo phần chênh bề ngang, căn giữa dịch nửa phần chênh, co giãn theo tỉ lệ. `dc.py match` thử cả 4 kiểu và báo kiểu khớp nhất.

**Phần hệ thống không thuộc app — loại khỏi so sánh:** status bar, thanh điều hướng, notch/Dynamic Island, bàn phím ảo, home indicator, hộp thoại quyền của OS.

**Mốc dọc = đỉnh header của app ở cả hai phía** (`--design-top` / `--actual-top`), **không** phải chiều cao status bar. Status bar trong Figma là hình giả lập (thường 24–36), status bar thật cao khác (VD 53 dp), và app tràn viền có thể vẽ header lấn vào vùng đó. Lấy status bar làm mốc → mọi phần tử lệch giả cùng một lượng. Đo đỉnh header **một lần** ở màn có header (y của khối header trong spec app), dùng cho mọi khung của cùng app. Header lấn vào safe area là việc soát riêng (mục 5), không trộn vào số đo bố cục.

---

## 4. Dung sai mặc định

| Thuộc tính | ✅ Khớp | ⚠️ Lệch nhỏ | ❌ Lệch | Ghi chú |
|---|---|---|---|---|
| Vị trí, kích thước (mobile) | ≤ 4 | ≤ 12 | > 12 | Bounds của cây phần tử mobile là khung phần tử, có padding |
| Vị trí, kích thước (web) | ≤ 2 | ≤ 6 | > 6 | Đo được tới ink box của chữ — chặt hơn được (`--tol 2`) |
| Cỡ chữ | ± 0,5 | < 2 | ≥ 2 | Chỉ web (computed style) có số đo trực tiếp; mobile native suy từ chiều cao dòng |
| Độ đậm | bằng | lệch 100 | lệch ≥ 200 | |
| Font family | trùng | — | khác | Font fallback (font chưa tải) cũng là ❌ |
| Màu chữ (ΔE2000) | ≤ 6 | ≤ 15 | > 15 | Ngưỡng nới vì màu chữ trên ảnh chụp bị khử răng cưa. Web đọc `color` trực tiếp thì dùng ngưỡng màu nền |
| Màu nền, viền (ΔE2000) | ≤ 3 | ≤ 7,5 | > 7,5 | ΔE ≤ 1 mắt thường không thấy · > 5 thấy rõ |
| Nội dung chữ | nguyên văn | chỉ khác ký tự trình bày (nháy `’`/`'`, hoa-thường, khoảng trắng) | khác chữ / thiếu / thừa | Chữ trong `<…>` của thiết kế là **dữ liệu động** — chỉ khớp khuôn |

Dự án có quy định riêng (design system ghi dung sai) → dùng quy định đó, ghi vào đầu báo cáo, truyền vào `dc.py` bằng `--tol` / `--tol-size` / `--de-text` / `--de-fill`.

**Xô lệch dây chuyền:** một khối phía trên cao hơn thì mọi phần tử bên dưới lệch theo. Chỉ phần tử có **khoảng cách tới phần tử khớp ngay phía trên** thay đổi mới là chỗ khởi phát — ghi **một** DIFF cho chỗ đó, các phần tử kế thừa không tính lại. Phần tử neo đáy (bottom nav, nút cố định) đo theo khoảng cách tới đáy màn hình.

---

## 4b. Thứ tự soát — ngoài → trong, trên → dưới, trái → phải

Bảng đo tự động chỉ thấy **chữ** và **khối có nền/viền**. Icon, ảnh, khoảng cách giữa khối, lề trong của thẻ… lọt qua nếu người soát nhìn ảnh theo cảm hứng. Mỗi khung phải đi **đủ** lưới soát theo đúng thứ tự:

| Cấp | Là gì | Soát gì |
|---|---|---|
| **L0** Khung màn | Toàn màn hình | Nền · bề ngang · safe area (status bar, notch, thanh điều hướng không che nội dung) · đã cuộn hết màn thật · không tràn ngang |
| **L1** Vùng | Header · thân · footer / bottom nav · lớp phủ | Có đủ vùng, đúng thứ tự · chiều cao · **margin** tới mép màn · nền |
| **L2** Khối | Thẻ, form, bảng, nhóm nút, banner | Kích thước · nền · viền · bo góc · bóng · **margin** (tới mép màn) hoặc **padding** (trong khối cha) · **gap** tới khối liền trước |
| **L3** Phần tử | Chữ · ô nhập · nút · icon · ảnh | Bảng dưới · **padding** trong khối chứa · **gap** tới phần tử liền trước |

| Loại phần tử L3 | Thuộc tính phải soát |
|---|---|
| Chữ | Nội dung · **font family · cỡ · độ đậm** · line-height · màu · căn lề · cắt `…` / xuống dòng |
| Ô nhập | Nhãn · placeholder · chiều cao · viền · bo góc · icon trong ô · padding trong · trạng thái (focus / lỗi / disabled) |
| Nút | Chữ (như dòng *Chữ*) · kích thước · nền · viền · bo góc · trạng thái |
| Icon | Có / đúng hình · kích thước · màu · **gap** tới chữ đi kèm |
| Ảnh | Có · tỉ lệ khung · kích thước · bo góc · không méo / vỡ |

**Ba từ khoảng cách — dùng đúng nghĩa trong DIFF:** **margin** = từ mép khối tới mép màn (hoặc tới khối ngoài cùng cấp) · **padding** = từ viền khối tới nội dung bên trong · **gap** = khoảng trống giữa hai phần tử anh em liền nhau.

`dc.py checklist` sinh sẵn lưới này cho từng khung từ spec Figma (kèm kết quả máy đo khi truyền `--match`). Mỗi dòng phải có kết quả — ✅ máy đo, ☑ người soát đã nhìn, hoặc mã DIFF — **trước** khi kết luận khung. Dòng chưa có kết quả = khung chưa soát xong.

---

## 5. Loại trừ và trường hợp đặc biệt

| Tình huống | Xử lý |
|---|---|
| Dữ liệu động (tên tài khoản, số lượng, ngày giờ) | Chỉ so **khuôn** (`total: <n> users`), không so giá trị |
| Thông báo thoáng qua (toast, snackbar) | Tạo lại đúng hành động sinh ra nó rồi chụp **ngay**. Không kịp → ❔ kèm lý do, không ghi "thiếu" |
| Ảnh raster, ảnh minh hoạ | So **có/không**, vị trí, kích thước, tỉ lệ khung — không so pixel |
| Icon | Mockup: so đúng icon (hình dạng, màu). Wireframe: chỉ so có/không và vị trí |
| Màn hình dài hơn một viewport | Chụp từng đoạn sau khi cuộn, so từng đoạn với `--auto-offset`. Khung Figma ghi "full scroll" là bản vẽ toàn trang, **không** phải màn hình đầu |
| App có cài đặt người dùng ảnh hưởng giao diện | Ghi lại và đưa về mặc định trước khi so: cỡ chữ hệ thống (`adb shell settings get system font_scale` = `1.0`), dark mode, màu chủ đề do người dùng chọn, ngôn ngữ |
| Nhiều trạng thái của cùng một phần tử (hover, focus, disabled, error) | Mỗi trạng thái Figma vẽ = một lượt chụp riêng |
| Thiết kế và requirements mâu thuẫn | **Không** ghi DIFF cho dev — mở `AMB` ở tài liệu requirements của module, ghi DIFF `Cần PO quyết` |
| Một khung vẽ **hai trạng thái không thể xảy ra cùng lúc** (VD lỗi "bắt buộc" khi ô trống + toast "sai mật khẩu" vốn chỉ hiện khi đã nhập) | Tái tạo **từng** trạng thái riêng, so phần tương ứng; ghi một DIFF `STATE` cho **thiết kế** — khung không mô tả được hành vi thật |
| Lớp phủ (menu, dialog, bottom sheet) vẽ đè lên một màn khác | Khi lớp phủ mở, cây phần tử của app thường **chỉ còn** lớp phủ (nền bị ẩn khỏi cây trợ năng) → so riêng lớp phủ (`SCOPE` trong `figma_extract.js`); nền so ở khung của chính nó |
| Thông báo thoáng qua biến khỏi cây phần tử sau 2–3 giây | Ảnh chụp **ngay** là bằng chứng chính; vị trí đo trên ảnh (đơn vị = px ÷ hệ số), không chờ page source |
| Header/footer cố định khi cuộn (sticky) | Đo ở đoạn đầu; ở đoạn cuộn sau chúng đứng yên — không tính lệch. Phần tử bị header cố định che → coi là ngoài màn |
| Thiết kế dùng **dữ liệu mẫu** (tên người, giá, mã, ngày) | Khai báo cho máy biết (`--sample`) — so **khuôn**, không so giá trị. Hàng/thẻ lặp (danh sách) tự nhận là dữ liệu mẫu → so cấu trúc hàng bằng ảnh. **Không** sửa thiết kế, **không** lấy dữ liệu thật làm chuẩn |
| Thiết kế **lược bớt** (ghi chú *"lược bớt"*, *"rút gọn"*, *"… đầy đủ ≈ n mục"*) | Chỉ so chữ · trạng thái · màu, **không** so vị trí; phần app có mà thiết kế lược → không phải `EXTRA`. Kiểm đúng điều ghi chú hứa (VD *133 màu* → đếm). Dòng ghi chú của designer không phải nội dung |
| Khung vẽ **theo vai trò** (khách · đã đăng nhập · admin) | Mỗi vai trò một lượt so. App hiện nút/hành động mà khung của vai trò đó bỏ → `EXTRA` **High**, `Cần PO quyết`. **Không** bấm thử để "chứng minh" quyền — việc chặn phía server ghi *"cần Dev xác minh"* |
| Bảng / hàng nút **rộng hơn màn** (cuộn ngang) | Phần tử có trong cây nhưng nằm sát/vượt mép phải là **khuất** — người dùng không thấy nếu không cuộn ngang. Ghi `LAYOUT` (thường `Dev`); không coi là ⤵️ *ngoài màn đã chụp* |
| Không lấy được ảnh Figma (hết hạn mức gọi MCP, file khoá xuất ảnh) | Dựng ảnh sơ đồ từ JSON đã trích (`dc.py render`) → `_figma_render.png`, ghi rõ ở đầu báo cáo và ở khung đó. Số đo không đổi (đo từ JSON). **Không** bỏ khung |

---

## 6. Phân loại DIFF

**Mã:** `DIFF-<MODULE>-<nn>` (namespace hệ thống thứ hai: `DIFF-<HỆ_THỐNG>-<MODULE>-<nn>`). Đánh số **nối tiếp theo module**, dùng chung mọi nền tảng, tra mã kế tiếp ở danh mục `docs/design-reviews/README.md` (namespace: `docs/design-reviews/_<hệ-thống>/README.md`) — không đánh lại từ `01` mỗi lần chạy.

**Vòng đời DIFF — khi chạy lại cùng module × nền tảng** (sau khi dev/designer sửa, hoặc Figma cập nhật):

| Lệch ở lần chạy mới | Xử lý |
|---|---|
| Vẫn còn, **cùng nguyên nhân** với một DIFF đang 🔴 Mở | **Giữ mã cũ**, cập nhật số đo mới — không cấp mã mới |
| DIFF đang 🔴 Mở không còn lệch | Đổi `✅ Đã khắc phục (run_<timestamp>)` — dòng vẫn giữ trong báo cáo mới |
| Lệch mới chưa có DIFF | Cấp mã **nối tiếp** |
| Người có quyền quyết định giữ khác biệt | `⚪ Chấp nhận — <ai>, <DD-MM-YYYY>, <lý do>` — các lần sau không báo lại như lệch mới |
| Khung Figma đổi (vẽ lại) làm DIFF cũ hết ý nghĩa | `🗑️ Không còn áp dụng (Figma đổi <DD-MM-YYYY>)` — không xoá dòng |

Mã DIFF đã cấp **không bao giờ** dùng lại cho chỗ lệch khác — giống TC ID: bug, báo cáo cũ trỏ vào nó.

| Loại | Ví dụ |
|---|---|
| `CONTENT` | Chữ khác, sai chính tả, khác ngôn ngữ, placeholder khác |
| `MISSING` | Thiết kế có, app không có (nút, ô nhập, khối, trạng thái lỗi) |
| `EXTRA` | App có, thiết kế không vẽ |
| `LAYOUT` | Vị trí, khoảng cách, kích thước, thứ tự, căn lề, xuống dòng |
| `STYLE` | Màu, font, cỡ chữ, độ đậm, bo góc, viền, đổ bóng |
| `ASSET` | Icon/ảnh khác loại |
| `STATE` | Trạng thái vẽ trong Figma app không có hoặc hiển thị khác (lỗi, rỗng, disabled, loading) |

| Mức độ | Khi nào |
|---|---|
| **High** | Thiếu/thừa chức năng hoặc hành động · chữ sai nghĩa · trạng thái lỗi không hiện · phần tử bị che/không bấm được · sai màu thương hiệu ở CTA chính |
| **Medium** | Bố cục lệch thấy rõ bằng mắt · cỡ chữ/độ đậm sai · thiếu icon · khác thứ tự |
| **Low** | Lệch vài đơn vị · khác ký tự trình bày · màu lệch nhẹ (ΔE ≤ ngưỡng ❌) |

**Ai xử lý** (bắt buộc mỗi DIFF): `Dev` — app làm sai thiết kế · `Design` — thiết kế lỗi thời/thiếu so với app đã được duyệt · `Cần PO quyết` — không rõ bên nào đúng, hoặc mâu thuẫn requirements. Mặc định khi chưa rõ: `Cần PO quyết`, **không** mặc định đổ cho dev.

Xác định **chiều dẫn dắt** trước khi gán: thiết kế làm **trước** để dev dựng theo → app lệch thường là `Dev`. Thiết kế được vẽ **sau, theo app đang chạy** (wireframe tài liệu hoá, ghi chú kiểu *"dựng theo app"*) → app là nguồn, lệch thường là `Design`. Lệch là phần **chức năng** (thừa/thiếu cả khối, trạng thái) thì luôn `Cần PO quyết` bất kể chiều nào.

**Chiều dẫn dắt không áp cho lỗi hiển nhiên.** Chữ sai nghĩa (breadcrumb ghi tên trang khác, câu xác nhận thiếu tên đối tượng), lỗi hành vi (thông báo lỗi của form này dính sang form khác), thông tin bị khuất khỏi màn hình → `Dev` kể cả khi thiết kế vẽ theo app — không ai cố ý vẽ theo một lỗi. DIFF hành vi (`STATE`) giao `Dev` phải **tái hiện độc lập ít nhất một lần nữa** từ trạng thái sạch; ô *Thực tế* ghi các bước + `tái hiện n/n lần`.

**Thành phần dùng chung — một lệch, một mã.** Header, bottom nav, ô nhập, nút hộp thoại, bảng… lặp trên nhiều module: cấp DIFF **ở module phát hiện đầu tiên**; báo cáo module khác chỉ **dẫn chiếu** mã đó (dòng *"Dùng chung với module khác"* ở mục Tóm tắt), có thể ghi thêm khung của module khác vào cột *Khung* dạng `(+ B-09)`. Danh mục giữ bảng *Thành phần dùng chung* để lần sau tra. Cấp lại mã mới ở từng module = dev nhận 3 bug cho 1 chỗ sửa.

**Cột *Khung*:** mã khung ngăn bằng `·` (`A-01 · A-03`), dải liên tiếp `B-01 → B-04`, khung của module khác trong ngoặc `(+ B-09)` — viewer đọc theo đúng ba dạng này.

### Viết DIFF cho người không đọc toạ độ

DIFF được đọc bởi dev, designer, PO — **không ai** mở bảng đo để tra `x 272`. Ô *Mô tả* · *Thực tế* · *Thiết kế* viết bằng thứ nhìn thấy được:

| Thành phần | ✅ Viết | ❌ Không viết |
|---|---|---|
| Gọi tên phần tử | Chữ hiển thị / vai trò + vị trí trong màn: *nút **Login account** trong thẻ Sign in*, *menu **Sort By*** | `TextView[12]`, `Box`, `B2`, số dòng bảng đo |
| Lệch vị trí | Theo từ khoảng cách mục 4b: *cách mép phải **0 dp**, thiết kế **16 dp*** · *gap từ ô Password tới nút **25 dp**, thiết kế **18 dp** (rộng hơn 7 dp)* | `x 272 · y 416`, `Δx −45`, `Δy +15` |
| Lệch kích thước / kiểu chữ | *rộng **160 dp**, thiết kế **220 dp** (hẹp hơn 60 dp)* · *cỡ chữ **14**, thiết kế **16*** | `[272, 216, 160, 224]` |
| Hậu quả | *tên khuyến mãi bị cắt, người dùng không đọc được* | — |

Toạ độ thô (`x`, `y`, `Δx`, `Δy`, `[x, y, w, h]`) **chỉ** nằm trong bảng đo (mục 4 của báo cáo) và trong spec khoanh ảnh. Mỗi DIFF đi kèm **ảnh khoanh đúng / sai** (mục 7) — chữ và ảnh cùng kể một câu chuyện.

### Cùng khung Figma trên nhiều nền tảng / biến thể — một lệch, không log trùng

Một bộ khung Figma thường dùng cho nhiều lượt chạy: **mobile web** và **app** chung thiết kế, hoặc web desktop + mobile web cùng một màn. Chạy lượt thứ hai mà không tra lượt thứ nhất là log lại đúng lệch đã có, không ai biết hai mã là một.

**Trước khi cấp mã mới** (lượt nào cũng làm): tra bảng *Sổ khung Figma* trong danh mục → các DIFF 🔴 Mở trên **cùng node-id khung** ở nền tảng / biến thể khác của cùng module → mở báo cáo đó, so từng lệch vừa thấy:

| Lệch vừa thấy so với DIFF đã có ở nền tảng khác | Hai nền tảng **chung mã nguồn giao diện** (app Hybrid/WebView nạp cùng frontend với mobile web · web desktop và mobile web là một trang responsive) | **Khác** mã nguồn (app native ↔ web) |
|---|---|---|
| Cùng phần tử, cùng kiểu lệch | **Dùng lại mã cũ** — thêm nền tảng này vào cột *Nền tảng* của DIFF, thêm link ảnh của lượt này. Không cấp mã mới | **Cấp mã mới** (sửa ở hai nơi khác nhau), cột *Liên quan* ghi mã của nền tảng kia — người đọc thấy ngay đây là cùng một lệch thiết kế |
| Cùng phần tử, khác kiểu lệch | Mã mới, *Liên quan* trỏ mã kia | Mã mới, *Liên quan* trỏ mã kia |
| Lệch ở nền tảng kia **không** xuất hiện ở lượt này | Ghi vào báo cáo lượt này: *"không tái hiện trên <nền tảng>"* — **không** đổi trạng thái DIFF (đó là quyết định của lượt chạy trên nền tảng kia) | Như bên trái |

Chung hay khác mã nguồn: mode MOBILE nhận diện app Hybrid (WebView) → hỏi user **một lần** app có nạp cùng frontend với bản web không, ghi vào bảng *Nền tảng & biến thể* của danh mục. Không chắc → coi là **khác** (mã mới + *Liên quan*) — log thừa có liên kết vẫn hơn gộp nhầm hai lỗi khác nhau làm một.

---

## 7. Evidence

- Mỗi màn hình tối thiểu: ảnh Figma · ảnh app · ảnh **đặt cạnh nhau** (`_side.png`)
- Có DIFF → **ảnh khoanh đúng / sai** `_marked.png` dựng bằng `dc.py mark` — **bắt buộc** đủ 3 thứ:
  1. Figma | App **đặt cạnh nhau** trong cùng một ảnh
  2. Mỗi DIFF khoanh ở **cả hai phía**, **cùng số thứ tự**: khung **xanh** bên Figma = chỗ đúng theo thiết kế · khung **đỏ** bên App = chỗ lệch · app **thiếu** phần tử → khung đỏ **nét đứt** ở chỗ đáng lẽ phải có · thiết kế không có (`EXTRA`) → chỉ khoanh bên App
  3. **Dải ghi chú** dưới ảnh, mỗi DIFF một khối: `mã · tiêu đề` + `Thiết kế (đúng): …` + `Thực tế (sai): …` — viết theo mục 6 *Viết DIFF cho người không đọc toạ độ*

  Ảnh chỉ khoanh bên App (`dc.py annotate`) **không** đủ làm evidence của DIFF — người nhận không biết đúng phải trông thế nào. Ở kiểu *Xem nhanh* (chưa cấp mã) cũng dựng ảnh này, nhãn là số thứ tự lệch
- Nằm ở `docs/design-reviews/<module>/<nền-tảng>/run_<timestamp>/evidence/` — tên ASCII `<mã-khung>_<mô_tả>_{figma|app|side|marked}.png`
- **Mở lại từng ảnh** sau khi tạo — khung khoanh đọc toạ độ dễ lệch; ảnh chụp sai trạng thái nguy hiểm hơn không có ảnh
- File làm việc (spec JSON, page source, ảnh chồng, bản đồ khác biệt) để ở `reports/design-compare/<run>/` — **không** vào `docs/` (page source chứa dữ liệu thật)
- 🔒 Ảnh app chụp bằng **tài khoản test**; màn có dữ liệu khách hàng thật thì chụp vùng cần chứng minh, không chụp nguyên màn
- 🔒 Môi trường dùng chung thường hiện dữ liệu **người khác** (tác giả, người tạo, khách hàng): che trên **ảnh** (`dc.py mask`) **và** trong **bảng đo** (`dc.py match --redact`) trước khi vào `docs/` — bảng đo nằm trong báo cáo, lộ ở đó cũng là lộ. Dữ liệu tự sinh của automation (`auto_…@auto.test`) và tài khoản test (`@example.com`) không cần che
- Ảnh Figma dựng lại từ JSON (`dc.py render`) đặt tên `_figma_render.png` — không bao giờ đặt `_figma.png` cho ảnh không phải Figma xuất ra

---

## 8. NGHIÊM CẤM

- ❌ Sửa node trong Figma (kể cả "sửa tạm cho dễ so")
- ❌ Ghi DIFF khi chưa mở ảnh đặt cạnh nhau xác nhận
- ❌ Kết luận đạt/trượt bằng % pixel giống nhau
- ❌ So khung ở trạng thái A với app ở trạng thái B
- ❌ Đổ mọi DIFF cho dev mà không xét thiết kế có đúng không
- ❌ Mobile: bấm theo toạ độ để đưa app tới màn cần so (dùng locator — `appium_rules.md`). Nút chỉ có icon (⋮, bút sửa) → XPath **tương đối** theo chữ cùng hàng, không toạ độ
- ❌ Bấm *Lưu* / *Xoá* thật để tạo trạng thái trên môi trường dùng chung — chỉ submit khi validation **chắc chắn** chặn; hộp xác nhận xoá chỉ bấm *Huỷ*
- ❌ Đưa ảnh / bảng đo còn dữ liệu cá nhân chưa che vào `docs/`
- ❌ Web: `browser_resize` phóng viewport vượt cửa sổ headed để khớp khung Figma rộng (`playwright_rules.md` mục 1) — khung rộng hơn cửa sổ thì chạy headless
- ❌ Lưu page source, credentials, token vào `docs/`
- ❌ DIFF chỉ có ảnh khoanh bên App, không có phía Figma và ghi chú đúng / sai (mục 7)
- ❌ Ô *Mô tả* / *Thực tế* / *Thiết kế* của DIFF ghi toạ độ thô (`x 272`, `Δy +15`) thay cho margin / padding / gap / kích thước (mục 6)
- ❌ Kết luận một khung khi lưới soát (mục 4b) còn dòng chưa có kết quả
- ❌ Cấp mã DIFF mới mà chưa tra *Sổ khung Figma* xem cùng khung đã có DIFF ở nền tảng / biến thể khác (mục 6)
- ❌ Mobile web: so bằng Chrome desktop thu hẹp viewport, hoặc giả lập thiết bị bằng CDP trong phiên Playwright MCP chính — chụp ảnh là Playwright đặt lại viewport desktop, **âm thầm** mất giả lập (`web.md` mục 7)

---

## 9. Cache Figma — tiết kiệm lượt gọi MCP

Gói Figma có hạn mức lượt gọi; so lại cùng page (sau khi dev sửa, chạy nền tảng thứ hai) không cần trích + chụp lại khung Figma **không đổi**.

| Quy tắc | Lý do |
|---|---|
| Kho ở `reports/design-compare/_cache/<fileKey>/` — spec JSON + ảnh Figma + `manifest.json` | Đã `.gitignore`; chỉ chứa dữ liệu Figma (không có dữ liệu app) |
| Dùng lại theo **dấu vân tay từng khung** (`fp` của `figma_extract.js` khi liệt kê) — `dc.py cache plan` | Đổi bất kỳ chữ / toạ độ / màu / font nào trong khung → `fp` đổi → trích + chụp lại đúng khung đó. Dời khung trên canvas không tính là đổi |
| Lượt liệt kê (1 lượt gọi) vẫn chạy mỗi phiên | Là cách duy nhất biết Figma có đổi không. Bỏ qua lượt này (không gọi Figma lần nào) → được, nhưng báo cáo **phải** ghi *"Figma lấy từ cache ngày <DD-MM-YYYY>, chưa kiểm thay đổi"* |
| `fp` đổi → `cache put` **bỏ mọi bản cũ** của khung đó | Ảnh cũ ghép với spec mới là hai nguồn mâu thuẫn trong cùng một DIFF |
| Báo cáo ghi rõ khung nào lấy từ cache (ô *Ảnh Figma*) | Người đọc biết ảnh Figma trong evidence là của ngày nào |
