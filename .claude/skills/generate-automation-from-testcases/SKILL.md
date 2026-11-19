---
name: generate-automation-from-testcases
description: Cửa vào chung để sinh automation từ test cases — tự nhận nền tảng của file TC (web / mobile / api) rồi chuyển sang /generate-automation-web, /generate-automation-mobile hoặc /generate-automation-api. Mode WEB (mặc định) / MOBILE / API để chỉ định rõ.
argument-hint: "[WEB|MOBILE|API] [file TC]"
---

# Workflow: Sinh Automation từ Test Cases — Bộ định tuyến

> **Workflow này KHÔNG chứa logic sinh code.** Nó chỉ xác định bộ TC thuộc nền tảng nào rồi chuyển toàn bộ việc sang đúng workflow nền tảng. Mọi luật recon, POM/Screen Object, report, auto-heal nằm ở workflow đích — sửa luật thì sửa ở đó, **không** chép về đây.

## 3 Chế độ (Mode)

| Mode | Chuyển sang | Đầu vào đi kèm |
|---|---|---|
| **WEB** (mặc định) | `/generate-automation-web` — mode TC | File TC web · URL ứng dụng · credentials |
| **MOBILE** | `/generate-automation-mobile` — mode TC | File TC mobile · file app / package id · device |
| **API** | `/generate-automation-api` | File TC API · môi trường gọi thử |

**User không cần khai mode** — agent tự nhận theo thứ tự dưới. Chỉ khai khi muốn chỉ định rõ.

## Bước 1: Nhận diện nền tảng (theo thứ tự, gặp là dừng)

| # | Dấu hiệu | Kết luận |
|---|---|---|
| 1 | User nêu mode `WEB` / `MOBILE` / `API` | Theo user |
| 2 | Đường dẫn file TC có tầng nền tảng: `docs/testcases/<module>/web/…` · `mobile/…` · `api/…` (hoặc hậu tố tên file `_web` · `_mobile` · `_api`) | Theo tầng |
| 3 | Đưa file **index** `TEST_CASES_<TÊN_MODULE>_SUMMARY.md` → đọc `## Bản đồ tài liệu` | Một nền tảng → theo đó · **Nhiều nền tảng** → hỏi user chạy nền tảng nào; chọn "tất cả" thì chạy **lần lượt từng nền tảng**, mỗi nền tảng một lượt workflow đích |
| 4 | Tag / cột trong TC: `@Android` · `@iOS` → MOBILE · `@API` hoặc `Auto Type` = `API` → API · `@Web` → WEB | Theo tag |
| 5 | Không xác định được (bộ TC cũ chưa có tầng nền tảng, file ngoài repo) | **WEB** — công bố rõ là đang dùng mặc định |

- Một file TC cũ **lẫn** nhiều nền tảng (tag khác nhau) → tách theo tag, chạy từng nền tảng một lượt. Không đưa TC mobile cho workflow web
- **Công bố ngay câu đầu**, VD: *"File TC nằm ở `customers/mobile/` → chuyển `/generate-automation-mobile` mode TC."*

## Bước 2: Chuyển tiếp

1. Gọi workflow đích — qua `Skill` với đúng tên workflow, hoặc đọc `.claude/skills/<tên>/SKILL.md` và làm theo **toàn bộ** nội dung file đó
2. Truyền nguyên đầu vào user đã đưa (file TC, URL, app, device, tech stack…). Thiếu gì thì **workflow đích** hỏi — bộ định tuyến không hỏi thay
3. Chạy nhiều nền tảng → xong nền tảng này mới sang nền tảng kế; báo cáo cuối tách theo nền tảng

## Không có test case?

| Nền tảng | Dùng |
|---|---|
| Web — chỉ biết *"vào trang này, click cái kia"* | `/generate-automation-web` mode **FLOW** |
| Mobile — chỉ biết *"mở app, đăng nhập, tạo đơn"* | `/generate-automation-mobile` mode **FLOW** |
| API — mới có spec | `/generate-testcases-api` sinh TC trước, rồi `/generate-automation-api` |

## Gọi lại giữa chừng

Mỗi lần gọi (kể cả *"tiếp tục"*), bộ định tuyến nhận lại nền tảng từ file TC và chuyển sang **đúng workflow đích đang chạy dở**, tiếp tục tại bước tương ứng trong `task.md` — không bắt đầu lại từ đầu.
