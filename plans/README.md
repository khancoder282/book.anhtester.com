# Kế hoạch phát triển

Thư mục này lưu **kế hoạch** và **nhật ký thay đổi** của app web (frontend + backend). Mục đích chính là để repo app mobile (`../mobile-book.anhtester.com`) biết cần chỉnh theo những gì.

| File | Nội dung |
|---|---|
| [roadmap.md](roadmap.md) | Danh sách việc cần làm (tính năng, UI), trạng thái từng việc |
| [mobile-sync.md](mobile-sync.md) | Mỗi thay đổi đã làm trên web: API đổi gì, UI đổi gì, mobile phải làm gì, mobile đã làm chưa |

## Quy ước

- Làm xong một việc trong `roadmap.md` thì **cùng lúc**:
  1. Đổi trạng thái việc đó trong `roadmap.md` (ghi ngày `YYYY-MM-DD`).
  2. Thêm một mục vào `mobile-sync.md`: thay đổi API, thay đổi UI, file tương ứng bên repo mobile, việc mobile cần làm.
  3. Thay đổi API thì cập nhật luôn tài liệu API: Swagger (`detail` trong controller), `memory/features/<tính-năng>.md`.
- Ghi ngày tuyệt đối, không viết "hôm qua", "tuần trước".
- Không xoá mục cũ. Việc bỏ thì ghi trạng thái `Bỏ` kèm lý do.

## Trạng thái dùng chung

| Ký hiệu | Nghĩa |
|---|---|
| ⏳ | Chưa làm |
| 🚧 | Đang làm |
| ✅ | Xong trên web |
| 📱 | Mobile đã đồng bộ |
| ⛔ | Bỏ |
