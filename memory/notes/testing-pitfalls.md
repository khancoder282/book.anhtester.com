# Bẫy khi test từ shell trên Windows

Gặp trong đợt exploratory testing 2026-11-20.

## Git Bash làm hỏng tiếng Việt khi truyền cho curl

- Gõ JSON có dấu trong lệnh `curl -d '{"name":"Sách ..."}'` ở Git Bash thì ký tự có dấu bị đổi thành `?` trước khi tới server. DB lưu đúng nguyên chữ `S?ch Ki?m Th?`, và slug sinh ra sai theo (`sch-kim-th-mt`). **Đây không phải bug của app.**
- Test có tiếng Việt thì dùng script Bun (`fetch` gửi UTF-8 chuẩn) thay vì curl trong Git Bash.
- Client `mysql.exe` cũng hiện tiếng Việt thành `?`. Muốn kiểm tra thì xem qua API hoặc thêm `--default-character-set=utf8mb4`.

## Git Bash tự đổi đường dẫn bắt đầu bằng `/`

- Tham số như `-F "path=/poc-xss"` bị MSYS đổi thành `C:\Program Files\Git\poc-xss`. Đặt `export MSYS_NO_PATHCONV=1` trước khi gọi curl.

## `/tmp` của Git Bash khác `/tmp` của Bun

- File ghi ở `/tmp` trong Git Bash, Bun (bản Windows) đọc không thấy (ENOENT). Dùng đường dẫn Windows tuyệt đối, ví dụ thư mục scratchpad của phiên.

## Dữ liệu test trong DB local

- Ngày 2026-11-20 DB local đã được seed lại bằng bộ dữ liệu mẫu ([seed-data.md](seed-data.md)); dữ liệu test của đợt tìm bug (user `*@test.local`, sách `Sach KM *`, KM `PCTNEG`...) không còn nữa.
- ⚠️ Sau `PATCH /api/profile` hoặc `PATCH /api/user/{id}` mà không gửi email, user sẽ bị đổi email thành `user@example.com` (bug `BUG_user_1795111371_EXP01`). Khi đó các lần sửa profile sau đều lỗi; chạy lại `bun run seed --yes` là sạch.
