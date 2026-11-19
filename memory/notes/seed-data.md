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
| Book | 20 sách tiếng Việt, mỗi sách 2 ảnh (`bia-truoc.jpg`, `bia-sau.jpg`). 2 sách `UNAVAILABLE`. Mô tả do mình viết, không chép từ nguồn nào |
| Promotion | `SALE10` (%), `GIAM20K` (số tiền), `THIEUNHI15` (%), `FREESHIP` (không đổi giá), `BLACKFRIDAY30` (sắp diễn ra), `TET2026` (hết hạn), `SUMMER25` (đang tắt) |
| File | `tai-lieu/` (txt, md, csv), `hinh-anh/` (2 banner), `thu-muc-trong/` (thư mục rỗng), cộng ảnh sách và avatar |
| Address | 6 thành phố, 31 phường. **Chỉ là dữ liệu rút gọn**, không phải danh sách hành chính đầy đủ |

## Ảnh

- Ảnh bìa được vẽ bằng `backend/prisma/seed/tools/make_images.py` (Python + Pillow, font Cambria/Segoe UI của Windows), lấy nền từ `frontend/public/assets/images/cover/` của template. Đổi `data.json` (thêm sách, đổi tên) thì chạy lại script này rồi mới seed.
- Avatar copy từ `frontend/public/assets/images/avatar/`.
- Ảnh `product-*.webp` (giày) của template đã bị xoá khỏi repo ngày 2026-11-20 theo yêu cầu, vì app là quản lý **sách**. Đừng dùng lại ảnh không liên quan tới sách.
- Thẻ sách trên web là khung ngang nên bìa dọc bị cắt phần giữa; trang chi tiết hiện đủ.
- Đường dẫn ảnh lưu dạng `/$book-image/<slug>/bia-truoc.jpg` (dấu `/`). Upload qua app trên Windows thì `path.relative` trả về dấu `\`, nên dữ liệu do app tạo trên Windows có thể khác định dạng với dữ liệu seed.
