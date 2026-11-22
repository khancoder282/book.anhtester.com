# Dữ liệu mẫu (seed)

Tạo ngày 2026-11-20. Dùng làm DB mẫu cho web, API và app mobile.

## Chạy

```
cd backend && bun run seed --yes
```

- **Xoá toàn bộ** user (trừ `admin@example.com`), refresh token của user khác, sách, khuyến mãi, category, địa chỉ, và mọi thứ trong `backend/upload/` (trừ `$image-404.svg`). Admin giữ nguyên, kể cả token đang đăng nhập; chưa có admin thì script tạo mới với mật khẩu `123456`.
- Không có `--yes` thì không chạy. `DATABASE_URL` không phải localhost thì phải thêm `--allow-remote`, để tránh lỡ tay xoá DB trên VPS.
- Ngày khuyến mãi tính **tương đối** so với lúc chạy seed, nên chạy lại lúc nào cũng có đủ trạng thái đang chạy / sắp diễn ra / đã hết hạn / đang tắt.
- `currentPrice` được tính sẵn theo công thức `handlePrice` của `book-controller.ts`, chỉ cộng khuyến mãi đang bật và còn trong hạn.
- Backup DB trước lần seed đầu (dữ liệu test của đợt tìm bug) nằm ở scratchpad của phiên, không có trong repo.

## Nội dung (`backend/prisma/seed/data.json`)

| Module | Dữ liệu |
|---|---|
| User | Admin + 8 user `*@example.com`, mật khẩu `123456`. `huy.dang` và `huong.bui` bị khoá; `huong.bui` không có avatar, phone, address |
| Category | 9 category, `Ngoại ngữ` không có sách (để test category rỗng) |
| Book | 40 sách (từ 2026-11-21; web 36 sách/trang nên có "load more"). 20 sách đầu là tên sách thật, 20 sách sau **hư cấu** (tên, tác giả tự đặt). Đủ `author`, `publisher`, `publishYear`, `pageCount`, `isbn` (ISBN-13 hợp lệ, tiền tố `978604`, không trùng), `language` (`Tiếng Việt`; `clean-code` và `automation-testing-with-playwright-…` là `English`), `previewTitle`, `previewContent`. Mỗi sách 4 ảnh: `bia-truoc.jpg`, `bia-sau.jpg`, `trang-1.jpg`, `trang-2.jpg`. 5 sách `UNAVAILABLE`. 5 sách chủ là user bị khoá. Edge case: `be-tap-dem-cung-dan-vit-con` không có đọc thử (trang trong là Mục lục, lấy từ khoá `toc` chỉ dùng cho ảnh), `views` = 0; `thiet-ke-co-so-du-lieu-cho-nguoi-moi-bat-dau` không có `publisher`/`isbn`; 2 sách tên + mô tả rất dài (`tu-ganh-hang-rong-…`, `hanh-trinh-muoi-nam-…`); `chu-meo-muop-di-tim-mat-trang` giá 35.000 dính 2 khuyến mãi (giá hiện tại 9.750). Mô tả và đoạn đọc thử do mình viết, không chép từ nguồn nào |
| Promotion | `SALE10` (%), `GIAM20K` (số tiền), `THIEUNHI15` (%), `FREESHIP` (không đổi giá), `BLACKFRIDAY30` (sắp diễn ra), `TET2026` (hết hạn), `SUMMER25` (đang tắt) |
| File | `tai-lieu/` (txt, md, csv), `hinh-anh/` (2 banner), `thu-muc-trong/` (thư mục rỗng), cộng ảnh sách và avatar |
| Address | Đủ 34 tỉnh/thành, 3321 phường/xã/đặc khu hiện hành, ở file riêng `vn-address.json` (từ 2026-11-20). Chỉ nạp lại bảng này: `bun run seed:address --yes`. Xem `memory/features/address.md` |

## Ảnh

- Đoạn đọc thử (`previewContent`) là **văn bản tự viết cho mục đích test** (2026-11-21): sách thật thì là "Lời dẫn đọc" nói về chủ đề của sách, **không** chép, dịch hay diễn lại nội dung sách thật; sách hư cấu thì là chương 1 tự viết. Định dạng: đoạn cách nhau bằng dòng trống (`

`), dòng bắt đầu `## ` là tiêu đề con. Thêm sách thật thì giữ nguyên quy tắc này.
- `createdAt` của sách: 5 sách cuối `data.json` nằm trong 7 ngày gần đây (UI gắn nhãn "New" cho sách < 7 ngày), các sách còn lại rải ~10–112 ngày trước, không sớm hơn ngày tạo user chủ sách (trừ admin). Đổi thứ tự sách trong `data.json` là đổi sách nào "New".
- Mô tả sách không còn tiền tố "Tác giả: …" (tác giả có trường `author` riêng).
- Ảnh bìa được vẽ bằng `backend/prisma/seed/tools/make_images.py` (Python + Pillow, font Cambria/Segoe UI của Windows), lấy nền từ `frontend/public/assets/images/cover/` của template. Script vẽ luôn 2 trang trong `trang-1.jpg`, `trang-2.jpg` (nền giấy kem, font Cambria, tiêu đề chương + các đoạn đầu của `previewContent`; sách không có đọc thử thì vẽ trang Mục lục). Đổi `data.json` (thêm sách, đổi tên, đổi đoạn đọc thử) thì chạy lại script này rồi mới seed. Seed chỉ lấy những ảnh có thật trong thư mục sách, theo thứ tự bìa trước, bìa sau, trang 1, trang 2.
- Avatar copy từ `frontend/public/assets/images/avatar/`.
- Ảnh `product-*.webp` (giày) của template đã bị xoá khỏi repo ngày 2026-11-20 theo yêu cầu, vì app là quản lý **sách**. Đừng dùng lại ảnh không liên quan tới sách.
- Thẻ sách trên web là khung ngang nên bìa dọc bị cắt phần giữa; trang chi tiết hiện đủ.
- Đường dẫn ảnh lưu dạng `/$book-image/<slug>/bia-truoc.jpg` (dấu `/`). Upload qua app trên Windows thì `path.relative` trả về dấu `\`, nên dữ liệu do app tạo trên Windows có thể khác định dạng với dữ liệu seed.

- Production (2026-11-22): user yêu cầu devops đưa production về dữ liệu mẫu. Quy trình (sao lưu → pull → `db push` → `bun run seed --yes` → khởi động lại) ở README mục *Đưa production về dữ liệu mẫu (VPS)*. Dữ liệu mẫu đã nằm trong Git, không cần đẩy thêm file DB/dump nào.
