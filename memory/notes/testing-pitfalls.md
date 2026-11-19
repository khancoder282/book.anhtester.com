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

## Dữ liệu test trong DB local `book_anhtester`

- User test (đều có mật khẩu `123456` trừ khi ghi khác): `admin@example.com`, `p1..p4@test.local`, `u1@test.local` (mật khẩu bị đổi thành `hacked1` trong lúc test), `ui1@test.local` / `ui123456`, `c1@test.local`, `c3@test.local`, `t2/t3/t6/t7/t8-*@test.local`, `qa.user1@example.com` (không do phiên này tạo).
- Sách và khuyến mãi test: `Sach KM *`, `Sach Gia *`, `NoPromo *`, `Desc Check Book v2`, `Đắc Nhân Tâm`, KM `PCTNEG`, `FIX1M`, `BADDATE`, KM có code rỗng. Category `Novel`, `Testing`, `""`, `Tâm lý / Kỹ năng`.
- ⚠️ Sau `PATCH /api/profile` hoặc `PATCH /api/user/{id}` mà không gửi email, sẽ có user bị đổi email thành `user@example.com` (bug `BUG_user_1795111371_EXP01`). Khi đó mọi lần sửa profile sau đều lỗi, nên phải trả email về trong DB trước khi test tiếp.
- Đã dọn file PoC trong `backend/upload/` và `backend/` sau khi test.
