# [BUG] CATEGORY — Category có dấu / tạo được nhưng không xoá được

## Thông tin chung
- **ID:** BUG_category_1795111393_EXP02
- **Severity:** 🟡 Minor
- **Priority:** P3
- **Nền tảng:** `api`
- **Môi trường:** Local | `http://localhost:4566/api` (Bun 1.4.5 + Elysia, MySQL 8.4.13) | Windows 11 | —
- **Build / Version:** `deploy-vps` @ `5fcd241` (code backend từ `64d41c0`, frontend build từ cùng commit)
- **Test case liên quan:** — (exploratory testing `EXP02`, chưa có bộ TC)
- **REQ ID liên quan:** — (chưa có tài liệu requirements)
- **Test data đã dùng:** `admin@example.com`; category `Tâm lý / Kỹ năng`
- **Ngày phát hiện:** 20-11-2026

## Steps to Reproduce
1. `POST /api/category-book` `{"name":"Tâm lý / Kỹ năng"}` → 201.
2. `DELETE /api/category-book/T%C3%A2m%20l%C3%BD%20%2F%20K%E1%BB%B9%20n%C4%83ng` (đã URL-encode).

## Expected Result
Xoá được (200), hoặc từ chối tên có `/` ngay khi tạo.

## Actual Result
404 "Category not found.", category vẫn còn đó.

## Evidence
```
POST category 'Tâm lý / Kỹ năng'  201 {"msg":"Category created successfully."}
DELETE category có '/' (encode)   404 {"msg":"Category not found."}
```

## Ghi chú thêm
- **Tần suất tái hiện:** Luôn luôn
- **Workaround (nếu có):** Không có
- **Nghi ngờ root cause (nếu phân tích được):** Khoá chính của category là `name` và được truyền qua path param `/:name`. `%2F` bị giải mã thành `/` trước khi khớp route.

## Lịch sử retest
<!-- Do /retest-fixed-bugs ghi. Dòng mới thêm LÊN ĐẦU bảng. Bảng rỗng = chưa retest lần nào -->

| Ngày | Build | Kết quả | Retest report | Ghi chú |
|---|---|---|---|---|
