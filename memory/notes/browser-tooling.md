# Browser và MCP để test (Playwright, Appium)

## Ba cách mở trình duyệt trên máy này

| Cách | Tool | Ghi chú |
|---|---|---|
| Browser pane của app Claude | `mcp__Claude_Browser__*` | Khung trình duyệt nằm trong app, cạnh cuộc trò chuyện, **không phải cửa sổ Chrome riêng**. Mở dev server theo `.claude/launch.json` |
| Playwright MCP của repo | `mcp__playwright__*` | Khai báo trong `.mcp.json` của repo (thêm 2026-11-20). Chrome thật, phóng to toàn màn hình |
| Playwright MCP của app | `mcp__playwright-desktop__*` | Khai báo trong config máy, **hay bị lỗi profile**: xem bên dưới |

## Lỗi "Browser is already in use for ...mcp-chrome-97f4bac" (gặp 2026-11-20)

- `mcp__playwright-desktop__*` được khai báo trong `%LOCALAPPDATA%\Claude-Data\claude_pzs8sxrjxfjjc\claude_desktop_config.json` (bản Claude Desktop này **không** dùng `%APPDATA%\Claude\`) là `npx @playwright/mcp@latest` **không có tham số**, nên dùng profile mặc định dùng chung `ms-playwright-mcp\mcp-chrome-97f4bac`.
- Một phiên Claude khác (project `D:\TPONE\tpone-product-manager`, config `Temp\playwright-mcp-config.win32.json`) đã mở Chrome bằng đúng profile đó, nên phiên này bị chặn. Truyền `isolatedContext` vào `browser_tabs` **không giúp được**, vì lỗi xảy ra ngay lúc khởi động browser.
- **Đừng đóng Chrome của phiên khác.** Hãy dùng `mcp__playwright__*` của repo: server này chạy `--isolated` nên không giành profile.

## Playwright MCP của repo

`.mcp.json` chạy: `npx -y @playwright/mcp@latest --isolated --config .claude/playwright-mcp-config.json --output-dir ${LOCALAPPDATA:-}${TMPDIR:-}/playwright-mcp-output/book-anhtester`

- `.claude/playwright-mcp-config.json`: Chrome (`channel: chrome`), có giao diện, `--start-maximized`, `viewport: null` để trang theo đúng kích thước cửa sổ.
- Đo thật ngày 2026-11-20: `screen 1366×854`, `outer 1366×815`, `inner 1366×728`, nghĩa là cửa sổ đã phóng to hết vùng màn hình khả dụng.
- Snapshot (`page-*.yml`) và log console được ghi vào `%LOCALAPPDATA%\playwright-mcp-output\book-anhtester\`, nằm **ngoài repo**, nên repo không sinh thư mục `.playwright-mcp`.
- `--isolated` giữ profile trong RAM, nên **mỗi lần chạy phải đăng nhập lại**.
- `${LOCALAPPDATA:-}${TMPDIR:-}`: trên Windows chỉ có `LOCALAPPDATA`, trên macOS chỉ có `TMPDIR`, nên một dòng dùng được cho cả hai hệ điều hành. Trên Windows **không được đặt biến `TMPDIR`**, nếu không đường dẫn sẽ bị ghép sai.
- Chụp ảnh bằng `browser_take_screenshot` thì **đừng truyền `filename` tương đối**, vì tên tương đối được tính theo thư mục làm việc của process chứ không theo `--output-dir`.
- Các lỗi console `401 /api/me` và `422 /api/refetch-token` khi chưa đăng nhập là bình thường.

## Appium MCP của repo

`.mcp.json` chạy: `npx -y appium-mcp@latest` (package chính thức `appium/appium-mcp`), truyền `ANDROID_HOME` và `JAVA_HOME` từ biến môi trường của máy.

- Máy hiện có: `ANDROID_HOME=C:\Users\anhtester\AppData\Local\Android\Sdk`, `JAVA_HOME=C:\Program Files\Java\jdk-17`.
- Chạy thử 2026-11-20: server "MCP Appium" 1.99.3 khởi động được và có 32 tool (`select_device`, `appium_session_management`, `appium_gesture`, ...).
- `CAPABILITIES_CONFIG=capabilities.json` trỏ tới file `capabilities.json` ở gốc repo. File này là của user (có từ 2026-11-12), không phải do Claude tạo. Nội dung:
  - Android: emulator **`Medium_Phone`** (user đổi từ `Pixel_10_Pro_XL` ngày 2026-11-20), `udid: emulator-5554`, Android 17, UiAutomator2, app `com.anhtester.book` / `.MainActivity`, `noReset: true`.
  - Máy có 2 AVD là `Medium_Phone` và `Pixel_10_Pro_XL`, cả hai đều dùng `android-37.0` (API 37, tức Android 17) bản `google_apis_playstore` x86_64. Bật emulator: `"%ANDROID_HOME%\emulator\emulator.exe" -avd Medium_Phone`.
  - `udid` ghi cứng `emulator-5554`, tức emulator **đầu tiên** được bật. Nếu bật 2 emulator cùng lúc, hoặc bật `Pixel_10_Pro_XL` trước, thì `emulator-5554` sẽ không còn là `Medium_Phone`.
  - iOS: `iPhone 17 Pro Max`, XCUITest, `appium:app` vẫn là đường dẫn mẫu `/path/to/your/ios/app.ipa`.
- **Chạy thật ngày 2026-11-20**: bật `Medium_Phone`, chờ boot xong, cài APK, rồi qua Appium MCP gọi `select_device` (`emulator-5554`), `appium_session_management` với `action=create, platform=android`. Session tạo thành công (`Device: Medium_Phone`, UiAutomator2), app mở vào Dashboard.
  - Bật emulator: `"$ANDROID_HOME/emulator/emulator.exe" -avd Medium_Phone` (chạy nền). Chờ boot: `adb -s emulator-5554 wait-for-device shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'`. Kiểm tra đúng AVD: `adb -s emulator-5554 emu avd name`.
  - `appium_get_page_source` có `selector` hoặc `pattern` thì bắt buộc phải kèm `saveToFile=true`.
  - Ảnh chụp từ `appium_screenshot` được lưu vào `%TEMP%\screenshot_<timestamp>.png`.

## App mobile `com.anhtester.book`

- Source nằm ở `D:\source-book.anhtester.com\mobile-book.anhtester.com`, cạnh repo này. Đây là app **Capacitor** (React + Vite bọc trong WebView), `appId` và `applicationId` là `com.anhtester.book`, tên hiển thị "Book Anhtester".
- **Emulator ban đầu chưa cài app**, chỉ có `com.anhtester.erp`. APK build sẵn nằm ở `D:\TestingSkills\{claude-testing-skills,claude-testing-skills-new,codex-testing-skills,antigravity-testing-skills}\apps\anhtester-book-app-release.apk`. Bốn bản giống hệt nhau (md5 `e9dc3d7692af...`), versionName 1.0, minSdk 23, targetSdk 35. Cài bằng `adb -s emulator-5554 install -r <apk>`.
- ⚠️ **App gọi API production** (`URLBASE = "https://book.anhtester.com"` ghi cứng trong `mobile-book.anhtester.com/src/api/axios.ts`), **không gọi backend local**. Dashboard hiện 3479 users / 756 books là dữ liệu thật trên server. Test tạo, sửa, xoá trên app mobile sẽ thay đổi dữ liệu production.
- Bản release **chỉ có context `NATIVE_APP`**, không có `WEBVIEW_*` (WebView debugging đang tắt). Vì vậy phải tìm element qua cây accessibility native (UiAutomator2), không dùng được CSS selector.
- Thanh tab dưới cùng: Dashboard, User, Book, Promotion, File.

## Đường dẫn tương đối của `CAPABILITIES_CONFIG`

- Đường dẫn tương đối được tính theo thư mục làm việc của process (appium-mcp gọi `fs.readFile(process.env.CAPABILITIES_CONFIG)` trong `dist/tools/session/create-session.js`). **Nếu không tìm thấy file, appium-mcp chỉ ghi cảnh báo rồi dùng capability rỗng**, không báo lỗi. Thấy session tạo ra thiếu `appPackage` thì kiểm tra điểm này trước.

## Kích hoạt

- Server trong `.mcp.json` chỉ được nạp khi **mở phiên mới hoặc khởi động lại Claude**. Lần đầu Claude Code sẽ hỏi có cho phép server của project không.
- Muốn chạy thử một server mà không cần restart: dùng script gửi `initialize` và `tools/list` qua stdio với đúng lệnh trong `.mcp.json` (đã làm như vậy ngày 2026-11-20).
