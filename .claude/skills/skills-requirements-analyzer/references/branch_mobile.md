### 3.5. Nhánh Mobile Recon — phân tích app mobile thực tế

Dùng cho app **Native Android · Native iOS · Flutter · Hybrid** chạy trên emulator/simulator/thiết bị thật, qua **Appium MCP**. Workflow dùng nhánh này: `/discover-system` (Bước 3-M — tầng khám phá, 3.5.1 + 3.5.2), `/generate-requirements-from-mobile` (tầng module — cả 3.5). Là bản mobile của 3.1 — cùng mục tiêu, khác công cụ và khác những gì quan sát được.

> Thao tác phiên, nhận diện loại app, đọc thuộc tính phần tử: skill **`skills-mobile-debug-agent`** (Bước 1–3). Quy tắc nền tảng: [`appium_rules.md`](../../../rules/appium_rules.md).

#### 3.5.1. Chuẩn bị & nhận diện loại app — làm TRƯỚC khi recon

```
select_device → appium_session_management(create) → appium_get_page_source → NHẬN DIỆN LOẠI APP
```

> Phiên khảo sát chạy **nhúng trong Appium MCP** — không cần chạy Appium server riêng, không truyền `remoteServerUrl` trừ khi user đưa server/cloud. iOS chỉ khảo sát được trên **macOS** — máy Windows/Linux chỉ làm được Android. Tham số từng tool: skill `skills-mobile-debug-agent` mục *Bảng tool Appium MCP theo việc*.

| Kết quả nhận diện | Recon được gì |
|---|---|
| **Native** / **Flutter đã bật semantics** | Đầy đủ theo 3.5.2 |
| **Hybrid** | Phần native theo 3.5.2; phần WebView đổi context (`appium_context`) rồi đọc như DOM. **Bắt buộc** quay về `NATIVE_APP` sau đó |
| **Flutter CHƯA bật semantics** (chỉ một `FlutterView` rỗng) | ⚠️ **Chỉ recon được mức hình ảnh**: luồng, text hiển thị, message nhìn thấy. Cột `Nguồn` = `Quan sát ảnh — chưa đọc được phần tử`. **Không** khai thuộc tính (bắt buộc, disabled, độ dài). Mở `AMB-<MODULE>-XX` 🔴 *"Dev bật semantics"* kèm 3 câu hỏi của `skills-mobile-debug-agent` mục Flutter. **CẤM** bấm theo toạ độ để dò màn hình — nhờ user dẫn đường |

Ghi vào metadata (6.1) dòng **`Thiết bị khảo sát`** thay cho `Trình duyệt khảo sát`:

```markdown
| **Thiết bị khảo sát** | Pixel 7 emulator · Android 14 · app `2.3.1 (build 231)` · bản `release` · locale `vi-VN` · `UiAutomator2` · loại app: Flutter (semantics bật) |
| **Tầng network** | ❌ Không quan sát được — chưa dựng proxy (xem 3.5.2) |
```

#### 3.5.2. Thu thập — ánh xạ từ 9 bước của 3.1

| Bước 3.1 | Web | Mobile |
|---|---|---|
| Khung giao diện | Header · sidebar · breadcrumb | App bar/toolbar · bottom navigation · drawer · tab · nút overflow `⋮` |
| Form & input | `type` · `required` · `maxlength` · `pattern` | `class` (`EditText` / `XCUIElementTypeTextField` / `XCUIElementTypeSecureTextField`) · `password` · `hint` · `enabled` · `focused`. ⚠️ **Hierarchy KHÔNG lộ** độ dài tối đa, bắt buộc, loại bàn phím → phải **thử thật** (nhập vượt độ dài, để trống rồi gửi) và ghi kết quả vào AC |
| Actions | Nút · link | Nút · **gesture không có nút** (vuốt để xoá, kéo để làm mới, nhấn giữ) — hỏi hoặc thử, không bỏ qua |
| Workflows | | Như web · thêm **nút Back hệ thống** (Android): ở mỗi màn hình Back đi đâu, form dở dang có hỏi xác nhận không |
| Thông báo lỗi | Inline · toast DOM | Lỗi inline (text lỗi dưới ô nhập) · **Toast Android** (`//android.widget.Toast`, biến mất sau ~2–3,5 giây — đọc và chụp **ngay** sau thao tác) · Snackbar · dialog |
| Tầng network (3.1.1) | `browser_network_requests` | ❌ **Appium không thấy HTTP.** Chỉ quan sát được khi QA dựng proxy (mitmproxy / Charles / HTTP Toolkit) **và** app không pin certificate. Không có → metadata ghi `Tầng network: không quan sát được`, **không** suy validation server-side. Module có mặt web/API → REQ server-side lấy từ nhánh đó |
| Phân quyền (3.1.2) | | Như web — thang 3 mức bằng chứng, mỗi role thiếu tài khoản một `AMB` |
| Trạng thái | | Như web |

#### 3.5.3. Nhóm yêu cầu riêng của mobile — cân nhắc TỪNG dòng

Đây là những nhóm `appium_rules.md` §10 bắt phải test. Không thu ở tầng requirements thì tầng test case không có REQ để neo vào. Nhóm nào không áp dụng → ghi **"Không áp dụng"** kèm lý do, **không** bỏ trống (giống quy ước 6.5/6.6).

| Nhóm | Recon gì | Cách thử an toàn |
|---|---|---|
| **Quyền runtime** | Xin quyền gì · lúc nào · từ chối thì app làm gì · chọn "không hỏi lại" thì sao | `appium_mobile_permissions` — Android `action=update` + `permissionChangeAction=revoke` · iOS Simulator `action=reset`; đọc nội dung hộp thoại bằng `appium_alert action=get_text` (chuỗi OS — không làm assertion). iOS máy thật: nhờ user |
| **Vòng đời app** | Đưa xuống nền rồi mở lại: dữ liệu đang nhập còn không · phiên còn không | `appium_app_lifecycle action=background` (+ `seconds`) |
| **Mất mạng** | Thông báo gì · dữ liệu đang nhập có mất · có tự thử lại | ⚠️ Appium MCP **không** có tool tắt mạng. Android có `adb`: `adb shell svc wifi disable` + `svc data disable` (bật lại `enable`) · iOS / không có `adb`: nhờ user bật chế độ máy bay. Không làm được → `❔` + `AMB-<MODULE>-XX`, **không** ghi đã kiểm |
| **Xoay màn hình** | Có hỗ trợ không · xoay có mất dữ liệu | `appium_orientation action=set` |
| **Bàn phím** | Có che ô nhập/nút gửi · nút Next/Done có chuyển ô | `appium_mobile_keyboard action=is_shown` + so vị trí phần tử (`bounds` Android / `rect` iOS) khi bàn phím mở |
| **Deep link** | Scheme/host app khai báo · mở link đi tới màn hình nào · chưa đăng nhập thì sao | Lấy danh sách link: `intent-filter` trong AndroidManifest / `CFBundleURLTypes` + associated domains trong Info.plist nếu có công cụ, không có → hỏi user. Mở thử bằng `appium_app_lifecycle action=deep_link` — chỉ link **đọc** |
| **Push notification** | Loại thông báo · bấm vào đi đâu | Thường không tự tạo được → `❔` + `AMB-<MODULE>-XX`. Có thông báo sẵn thì Android xem bằng `appium_mobile_device_control action=open_notifications` |
| **Phiên bản tối thiểu / cập nhật bắt buộc** | App cũ có bị chặn không | Hỏi user — không tự hạ phiên bản app |

#### 3.5.4. Android ↔ iOS

- Recon **riêng từng nền tảng** user cung cấp. ❌ Không suy iOS từ Android (và ngược lại) — cùng luật "không suy role B từ role A"
- Khác biệt ghi theo 2.2: rule giống → 1 REQ `Android · iOS`; rule khác → REQ riêng
- Chỉ có một nền tảng → REQ ghi đúng nền tảng đó; nền tảng còn lại ghi ở mục Phạm vi là *"chưa khảo sát"*, **không** là "như Android"

#### 3.5.5. Evidence mobile — khác 7.2.1 ở đâu

| Quy tắc 7.2.1 | Áp cho mobile |
|---|---|
| Ảnh chứa trọn đối tượng | `appium_screenshot` chụp **màn hình thiết bị** — không có full-page. Màn hình dài → cuộn và chụp nhiều ảnh `_part1`, `_part2`…, ghi thứ tự trong Danh mục Evidence |
| Tên ảnh | `mobile/evidence/<android\|ios>_<màn_hình>_<trạng_thái>[_partN].png` — VD `android_login_error_toast.png`. Android và iOS chung thư mục `mobile/evidence/`, phân biệt bằng tiền tố. Hậu tố `_viewport`/`_fullpage` **không** dùng cho mobile |
| 🔒 Vệ sinh dữ liệu | **Thanh trạng thái và thông báo** hay lộ tên người gửi, nội dung tin nhắn, tên mạng Wi-Fi → bật chế độ Không làm phiền / xoá thông báo **trước** khi chụp. Không tránh được → báo user trước khi commit |
| Lưu ảnh | `appium_screenshot` **không** nhận đường dẫn — nó tự lưu file và trả về đường dẫn. **Copy** file đó vào `mobile/evidence/` với tên chuẩn; chụp riêng một phần tử thì truyền `elementUUID` (đúng luật chụp đúng phạm vi) |
| Mở lại ảnh xác nhận | Giữ nguyên — `Read` bản **đã copy** vào evidence, nhất là ảnh **toast**, rất dễ chụp hụt |
| Ảnh không thay việc đọc phần tử | Thay "đọc DOM" bằng **đọc thuộc tính qua `appium_get_element_attribute`** (`enabled`, `displayed`, `password`, `content-desc`, `bounds`) và chép số liệu vào AC. **Không** lưu cả page source vào `docs/` — thường chứa dữ liệu người dùng |
