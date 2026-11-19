# [BUG] CATEGORY — Tạo sách với category rỗng sinh ra category tên rỗng; tạo category rỗng hoặc chỉ có khoảng trắng báo nhầm "Category already exists"

## Thông tin chung
- **ID:** BUG_category_1795111392_EXP01
- **Severity:** 🟡 Minor
- **Priority:** P3
- **Nền tảng:** `api`
- **Môi trường:** Local | `http://localhost:4566/api` (Bun 1.4.5 + Elysia, MySQL 8.4.13) | Windows 11 | —
- **Build / Version:** `deploy-vps` @ `5fcd241` (code backend từ `64d41c0`, frontend build từ cùng commit)
- **Test case liên quan:** — (exploratory testing `EXP01`, chưa có bộ TC)
- **REQ ID liên quan:** — (chưa có tài liệu requirements)
- **Test data đã dùng:** `admin@example.com`
- **Ngày phát hiện:** 20-11-2026

## Steps to Reproduce
1. `POST /api/book` `{"name":"Sach Category Rong","categories":[""],"price":1000}`.
2. `GET /api/category-book`.
3. `POST /api/category-book` `{"name":""}` và `{"name":"   "}`.

## Expected Result
Không cho category tên rỗng, cả khi tạo trực tiếp lẫn khi tạo qua sách; báo lỗi validation đúng.

## Actual Result
Danh sách có `{"name":"","bookCount":1}`. Tạo `""` hay `"   "` đều trả 400 "Category already exists.".

## Evidence
```
GET /category-book  200 {"list":[{"name":"","bookCount":1},{"name":"Novel",...},{"name":"Testing",...}]}
POST category rỗng          400 {"msg":"Category already exists."}
POST category khoảng trắng  400 {"msg":"Category already exists."}
```

## Ghi chú thêm
- **Tần suất tái hiện:** Luôn luôn
- **Workaround (nếu có):** Không có
- **Nghi ngờ root cause (nếu phân tích được):** `bodyBook.categories = t.Array(t.String())` không có `minLength` cho phần tử, và `connectOrCreate` tạo category mới với tên đó. MySQL so sánh theo PAD SPACE nên `"   "` bằng `""`.

## Lịch sử retest
<!-- Do /retest-fixed-bugs ghi. Dòng mới thêm LÊN ĐẦU bảng. Bảng rỗng = chưa retest lần nào -->

| Ngày | Build | Kết quả | Retest report | Ghi chú |
|---|---|---|---|---|
